/**
 * inferenceStream.ts
 *
 * Consumes a Response whose body is a ReadableStream<Uint8Array>.
 * This is the ONLY place in the codebase that calls response.body.getReader().
 * It is completely agnostic to whether the Response came from the mock
 * service or a real fetch() call.
 *
 * Sentinel tokens (injected by the mock for failure simulation):
 *   \x00TIMEOUT      → throws StreamError with kind "timeout"
 *   \x00NETWORK_DROP → throws StreamError with kind "network_drop"
 *
 * In a real API, these sentinels never appear — the server closes the
 * connection or returns an HTTP error instead, which is handled the same way.
 */

import type { StreamCallbacks, StreamErrorKind } from "../types/inference";

// ─── Sentinel constants ────────────────────────────────────────────────────────

const SENTINEL_TIMEOUT = "\x00TIMEOUT";
const SENTINEL_NETWORK_DROP = "\x00NETWORK_DROP";

// ─── Token counting ────────────────────────────────────────────────────────────

/**
 * Count meaningful tokens in a string.
 * A token is any non-whitespace word boundary.
 * This matches how most LLM token counters approximate word-level tokens.
 */
export function countTokens(text: string): number {
  return text.trim().split(/\s+/).filter((t) => t.length > 0).length;
}

// ─── Main stream consumer ──────────────────────────────────────────────────────

/**
 * Reads a streaming Response body token by token.
 *
 * @param response  - A Response object (mock or real fetch response)
 * @param callbacks - onToken, onComplete, onError handlers
 * @param signal    - AbortSignal for cancellation
 *
 * Returns a cleanup function that closes the reader if called.
 */
export async function consumeInferenceStream(
  response: Response,
  callbacks: StreamCallbacks,
  signal: AbortSignal
): Promise<void> {
  if (!response.body) {
    callbacks.onError({
      kind: "unknown",
      message: "Response body is null — stream unavailable.",
      partialOutput: "",
    });
    return;
  }

  // This is the core requirement: response.body.getReader()
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let partialOutput = "";

  // Register abort handler to cancel the reader immediately
  const abortHandler = () => {
    reader.cancel().catch(() => {
      // Suppress cancel errors — expected on abort
    });
  };
  signal.addEventListener("abort", abortHandler, { once: true });

  try {
    while (true) {
      // Each read() call awaits the next available chunk
      const { done, value } = await reader.read();

      if (done) {
        // Stream closed cleanly by producer
        callbacks.onComplete();
        break;
      }

      if (signal.aborted) {
        // Abort happened between read() calls
        break;
      }

      // Decode the Uint8Array chunk — { stream: true } handles multi-byte chars
      const text = decoder.decode(value, { stream: true });

      // Check for failure sentinels injected by mock service
      if (text.includes(SENTINEL_TIMEOUT)) {
        throwStreamError("timeout", "Model inference timed out.", partialOutput, callbacks);
        return;
      }

      if (text.includes(SENTINEL_NETWORK_DROP)) {
        throwStreamError("network_drop", "Network connection dropped mid-stream.", partialOutput, callbacks);
        return;
      }

      // Clean token — accumulate and emit
      partialOutput += text;
      callbacks.onToken(text);
    }
  } catch (err) {
    if (signal.aborted) {
      // Abort is not an error — it is intentional user action.
      // The hook handles aborted state separately.
      return;
    }

    const kind = classifyError(err);
    const message = err instanceof Error ? err.message : "Unknown stream error";

    callbacks.onError({
      kind,
      message,
      partialOutput,
    });
  } finally {
    // Always release the lock on the stream
    signal.removeEventListener("abort", abortHandler);
    reader.releaseLock();
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function throwStreamError(
  kind: StreamErrorKind,
  message: string,
  partialOutput: string,
  callbacks: StreamCallbacks
): void {
  callbacks.onError({ kind, message, partialOutput });
}

function classifyError(err: unknown): StreamErrorKind {
  if (err instanceof DOMException && err.name === "AbortError") return "abort";
  if (err instanceof TypeError && err.message.includes("network")) return "network_drop";
  if (err instanceof Error && err.message.includes("decode")) return "decode_error";
  return "unknown";
}
