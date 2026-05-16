/**
 * mockInferenceService.ts
 *
 * Produces a real Response object whose body is a ReadableStream<Uint8Array>.
 * The consumer reads it exactly like a real fetch() streaming response:
 *
 *   const { response } = await createMockInferenceResponse(request);
 *   const reader = response.body!.getReader();
 *   const decoder = new TextDecoder();
 *   while (true) {
 *     const { done, value } = await reader.read();
 *     if (done) break;
 *     const text = decoder.decode(value, { stream: true });
 *     // render text
 *   }
 *
 * To replace with a real API: swap this function with a real fetch() call.
 * The inferenceStream.ts consumer layer never changes.
 */

import type { InferenceRequest, InferenceResponse } from "../types/inference";

// ─── Sample model outputs ──────────────────────────────────────────────────────
// Multiple outputs so repeated runs feel different.

const SAMPLE_OUTPUTS: string[] = [
  `On-device inference operates by running quantized neural network weights directly on the device CPU or NPU, bypassing any network round-trip. The model is loaded into memory once, then evaluated against each input tensor in a forward pass. Latency is dominated by memory bandwidth and the number of floating-point operations per token, not by network conditions. This makes on-device inference ideal for latency-sensitive, privacy-preserving workloads where sending data to a remote server is unacceptable. The tradeoff is model size: quantization to INT4 or INT8 reduces weight size by 4-8x at the cost of slight accuracy degradation, which must be benchmarked per use case.`,

  `The ReadableStream API exposes a pull-based byte stream interface. A producer enqueues Uint8Array chunks into a ReadableStreamDefaultController. The consumer obtains a reader via stream.getReader() and calls reader.read() in a loop, receiving each chunk as it is enqueued. Because each read() call returns a Promise, the consumer naturally awaits each chunk without blocking the main thread. This is exactly how the Fetch API streams response bodies: response.body is a ReadableStream, and token-by-token rendering simply decodes each chunk with TextDecoder as it arrives, appending to the UI without waiting for the full response.`,

  `Transformer-based language models generate tokens auto-regressively: each token is conditioned on all previous tokens in the context window. During inference, the key-value cache stores intermediate attention computations so they are not recomputed for every new token. Without KV caching, inference cost grows quadratically with sequence length. With caching, each additional token costs only one forward pass through the network for the new position. On-device inference engines like llama.cpp and MLC-LLM implement KV caching in optimized C++ or WASM to achieve acceptable tokens-per-second on consumer hardware.`,
];

// ─── Timing constants ──────────────────────────────────────────────────────────

const TOKEN_DELAY_MS = 40;       // ms between tokens — feels like real streaming
const CONNECT_DELAY_MS = 300;    // simulates connection establishment
const NETWORK_DROP_AFTER = 0.45; // drop at 45% through the output
const TIMEOUT_AFTER_MS = 1800;   // timeout fires after 1.8s

// ─── Helpers ───────────────────────────────────────────────────────────────────

function pickOutput(prompt: string): string {
  // Deterministic pick based on prompt length so same prompt = same output
  const idx = prompt.length % SAMPLE_OUTPUTS.length;
  return SAMPLE_OUTPUTS[idx];
}

function tokenize(text: string): string[] {
  // Split on spaces but keep the space attached to the following word.
  // This produces natural word-by-word streaming.
  const words = text.split(" ");
  const tokens: string[] = [];
  for (let i = 0; i < words.length; i++) {
    tokens.push(i === 0 ? words[i] : " " + words[i]);
  }
  return tokens;
}

function encodeToken(token: string): Uint8Array {
  return new TextEncoder().encode(token);
}

// ─── Core factory ─────────────────────────────────────────────────────────────

/**
 * Returns a real Response object with a ReadableStream body.
 * The stream emits tokens one by one, simulating a live model.
 *
 * Architecture note:
 *   Real API replacement = swap this function with:
 *     return { response: await fetch("/api/infer", { method: "POST", body, signal }) };
 *   Everything downstream stays identical.
 */
export async function createMockInferenceResponse(
  request: InferenceRequest
): Promise<InferenceResponse> {
  const { prompt, failureMode = "none", signal } = request;

  // Simulate connection latency before the stream starts
  await delay(CONNECT_DELAY_MS, signal);

  const tokens = tokenize(pickOutput(prompt));
  const totalTokens = tokens.length;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Handle timeout: enqueue a poison-pill error chunk after N ms
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      if (failureMode === "timeout") {
        timeoutId = setTimeout(() => {
          // Enqueue a sentinel error token the reader can detect
          controller.enqueue(encodeToken("\x00TIMEOUT"));
          controller.close();
        }, TIMEOUT_AFTER_MS);
      }

      try {
        for (let i = 0; i < tokens.length; i++) {
          // Check abort signal on every token
          if (signal?.aborted) {
            controller.close();
            return;
          }

          // Simulate network drop mid-stream
          if (failureMode === "network_drop") {
            const progress = i / totalTokens;
            if (progress >= NETWORK_DROP_AFTER) {
              // Enqueue sentinel then close — reader treats this as a drop
              controller.enqueue(encodeToken("\x00NETWORK_DROP"));
              controller.close();
              return;
            }
          }

          // Enqueue the next token chunk
          controller.enqueue(encodeToken(tokens[i]));

          // Wait between tokens — this is what makes it feel like streaming
          await delay(TOKEN_DELAY_MS, signal);
        }

        // Clean completion
        if (timeoutId !== null) clearTimeout(timeoutId);
        controller.close();
      } catch (err) {
        if (timeoutId !== null) clearTimeout(timeoutId);
        // AbortError from delay() lands here
        controller.close();
      }
    },
  });

  // Wrap in a real Response object — identical to what fetch() returns
  const response = new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Mock-Service": "edge-inference-console",
    },
  });

  return { response };
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}
