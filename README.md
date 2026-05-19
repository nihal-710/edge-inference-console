# Edge Inference Developer Console

> A browser-based developer playground for evaluating on-device AI model inference — built as a frontend engineering assignment.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://edge-inference-console.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat-square&logo=github)](https://github.com/nihal-710/edge-inference-console)

---

## 🔗 Links

|                       |                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------- |
| **Live Demo**         | https://edge-inference-console.vercel.app/                                            |
| **GitHub Repo**       | https://github.com/nihal-710/edge-inference-console                                   |
| **Video Walkthrough** | https://drive.google.com/file/d/18ZqLCmSCpnJRaf07sYBMp-t4YMpckZOM/view?usp=drive_link |

---

## Overview

Edge Inference Developer Console is a production-grade frontend tool that simulates the experience of testing on-device AI model inference directly in the browser. It demonstrates:

- **Part A** — A streaming inference playground with multi-modal input (text + audio), real-time token metrics, and resilient error handling
- **Part B** — A side-by-side model output diff view powered by a manually implemented Wagner-Fischer dynamic programming algorithm
- **Session History** — A lightweight run inspector with localStorage persistence

No backend, no database, no auth. Every capability runs entirely in the browser using browser-native APIs.

---

## Features

### Part A — Inference Playground

- Token-by-token streaming using Fetch API + ReadableStream
- Text input with prompt validation and Ctrl+Enter shortcut
- Audio input using MediaRecorder API with permission handling, duration display, and audio preview
- Toggle between text and audio input modes
- Live metrics: token count, tokens/sec, elapsed time — updated every 100ms
- AbortController-based stream cancellation
- Partial output preservation on all failure paths
- Failure simulation: network drop, model timeout
- State machine: idle → connecting → streaming → completed / error / aborted
- Fully keyboard navigable with WCAG AA accessibility

### Part B — Model Output Diff View

- Manual Wagner-Fischer DP edit distance algorithm (no external libraries)
- Token-level diffing (word + punctuation tokenization)
- Four operations: equal, insert, delete, replace
- Side-by-side highlighted token rendering
- Summary stats: equal, inserted, deleted, replaced, total changes, similarity score
- Non-colour-only indicators (symbols: = + − ~)

### Session History

- Stores up to 50 recent inference runs
- Persisted to localStorage across page refreshes
- Run inspector: full output, metrics, error details, copy button
- Aggregate stats: total runs, average tok/s, average duration

---

## Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Framework   | React 18 + TypeScript                    |
| Build tool  | Vite 8                                   |
| Styling     | Tailwind CSS v3                          |
| Streaming   | Fetch API + ReadableStream + TextDecoder |
| Audio       | MediaRecorder API                        |
| State       | React useState + useReducer + useRef     |
| Persistence | localStorage                             |
| Icons       | lucide-react                             |
| Deployment  | Vercel                                   |

**No external diff libraries. No backend. No Redux. No auth.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                           │
│              (session state lifted here)                 │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │              Three pages                     │
    │  InferencePlayground │ DiffView │ SessionHistory │
    └──────┬──────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │           Service layer (no React)           │
    │  mockInferenceService.ts  inferenceStream.ts │
    │  tokenize.ts              tokenDiff.ts       │
    └──────┬──────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │              Custom hooks                    │
    │  useStreamingInference  useAudioRecorder     │
    │  useSessionHistory                           │
    └─────────────────────────────────────────────┘
```

The service layer is completely decoupled from React. Replacing the mock inference service with a real API requires changing exactly one function: `createMockInferenceResponse()` in `mockInferenceService.ts`. All downstream consumers (stream reader, hook, UI) remain unchanged.

---

## Folder Structure

```
src/
├── components/
│   ├── diff/              # Part B — diff view components
│   │   ├── DiffInputPanel.tsx
│   │   ├── DiffLegend.tsx
│   │   ├── DiffRenderer.tsx
│   │   ├── DiffSummary.tsx
│   │   └── DiffView.tsx
│   ├── history/           # Session history components
│   │   ├── RunInspector.tsx
│   │   └── SessionHistory.tsx
│   ├── layout/            # App shell and navigation
│   │   ├── AppShell.tsx
│   │   └── NavTabs.tsx
│   ├── playground/        # Part A — inference playground components
│   │   ├── AudioInputPanel.tsx
│   │   ├── FailureControls.tsx
│   │   ├── MetricsPanel.tsx
│   │   ├── StatusBanner.tsx
│   │   ├── StreamingOutput.tsx
│   │   └── TextInputPanel.tsx
│   └── ui/                # Reusable primitives
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── SectionHeader.tsx
│       ├── StatCard.tsx
│       └── StatusDot.tsx
├── hooks/
│   ├── useAudioRecorder.ts      # MediaRecorder lifecycle
│   ├── useSessionHistory.ts     # localStorage persistence
│   └── useStreamingInference.ts # State machine + metrics
├── pages/
│   ├── DiffView.tsx
│   ├── InferencePlayground.tsx
│   └── SessionHistory.tsx
├── services/
│   ├── inferenceStream.ts       # response.body.getReader() consumer
│   └── mockInferenceService.ts  # Returns real Response + ReadableStream
├── types/
│   ├── diff.ts
│   ├── index.ts
│   ├── inference.ts
│   └── session.ts
└── utils/
    ├── tokenDiff.ts    # Wagner-Fischer DP algorithm
    └── tokenize.ts     # Word-level tokenizer
```

---

## Streaming Implementation

The mock service creates a genuine `Response` object wrapping a `ReadableStream<Uint8Array>`:

```typescript
// mockInferenceService.ts — what a real API swap looks like
// Mock:
const stream = new ReadableStream({
  start(controller) {
    /* enqueue tokens */
  },
});
return { response: new Response(stream) };

// Real API (one-line swap):
return {
  response: await fetch("/api/infer", { method: "POST", body, signal }),
};
```

The consumer in `inferenceStream.ts` calls `response.body.getReader()` and loops with `await reader.read()`, decoding each `Uint8Array` chunk with `TextDecoder({ stream: true })`. This handles multi-byte characters correctly across chunk boundaries.

---

## Error Handling Strategy

Four distinct failure paths — all preserve partial output:

| Failure       | Trigger                       | State     |
| ------------- | ----------------------------- | --------- |
| Network drop  | Sentinel byte injected at 45% | `error`   |
| Model timeout | Sentinel byte after 1.8s      | `error`   |
| User abort    | AbortController.abort()       | `aborted` |
| Connect abort | Abort during connection delay | `aborted` |

`error` and `aborted` are distinct states. `aborted` is intentional user action and never shows an error message.

---

## Diff Algorithm

**Algorithm:** Wagner-Fischer dynamic programming (edit distance)

**Recurrence:**

```
dp[0][j] = j                          (insert j tokens)
dp[i][0] = i                          (delete i tokens)
dp[i][j] = dp[i-1][j-1]              (if tokens equal)
dp[i][j] = 1 + min(                  (otherwise)
  dp[i-1][j-1],  → substitute (replace)
  dp[i][j-1],    → insert
  dp[i-1][j]     → delete
)
```

**Complexity:** O(m × n) time, O(m × n) space

**Why not LCS:** LCS only produces insert+delete, missing replace operations.
**Why not Myers:** Myers optimises for low edit distance (code diffs). High token churn collapses Myers to O(m×n) worst case, identical to our approach, but without native replace support.

---

## Accessibility

- WCAG 2.1 AA compliant
- Full keyboard navigation (Tab, Arrow keys, Enter, Space)
- `aria-live="polite"` with `aria-relevant="additions text"` on streaming output
- `role="alert"` + `aria-live="assertive"` on errors
- `aria-busy="true"` on metrics during streaming (prevents screen reader spam)
- `role="tablist"` / `role="tab"` / `role="tabpanel"` on all tab controls
- `<fieldset>/<legend>` on radio groups
- Non-colour-only diff indicators (symbols: = + − ~)
- Skip-to-main-content link as first focusable element
- Contrast ratios verified against WCAG AA (4.5:1 minimum)

---

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/edge-inference-console.git
cd edge-inference-console
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Build

```bash
npm run build        # TypeScript compile + Vite bundle
npm run preview      # Preview production build locally
```

---

## Testing Checklist

```
[ ] Text inference streams token by token
[ ] Ctrl+Enter submits prompt
[ ] Stop Stream preserves partial output
[ ] Retry reruns same prompt
[ ] Network drop shows error with partial output
[ ] Timeout shows error with partial output
[ ] Audio recording works (requires microphone)
[ ] Microphone denied shows clear error
[ ] Diff Load Sample → Compare shows highlighted tokens
[ ] Identical diff inputs → 100% similarity
[ ] Session History persists after page refresh
[ ] Clear History removes localStorage entry
[ ] Tab navigation covers every control
[ ] Mobile layout at 375px — no overflow
```

---

## Known Limitations

1. Mock inference outputs are static text samples, not real model outputs
2. Audio mode submits a placeholder label — a real API would POST the audio blob
3. DP diff is O(m×n) space — impractical for very long outputs (>5000 tokens each)
4. Tokenization is heuristic — does not match BPE token boundaries used by LLMs
5. No authentication, persistence backend, or multi-user support (by design)

---

## Future Improvements

1. **Real API integration** — swap `createMockInferenceResponse()` with a fetch call
2. **Hirschberg's algorithm** — reduce diff space complexity to O(min(m,n))
3. **BPE tokenization** — match actual model token boundaries for accurate diffing
4. **Streaming audio transcription** — send audio chunks to a Whisper endpoint
5. **Export diff as HTML** — downloadable highlighted comparison report
6. **Keyboard shortcuts panel** — discoverable shortcut reference overlay
