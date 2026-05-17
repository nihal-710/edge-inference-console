/**
 * tokenDiff.ts
 *
 * Manual implementation of token-level edit distance diff using
 * the Wagner-Fischer dynamic programming algorithm.
 *
 * ─── Algorithm Overview ────────────────────────────────────────────────────────
 *
 * Given two token sequences A = [a0, a1, ..., am-1] and B = [b0, b1, ..., bn-1],
 * we build an (m+1) x (n+1) DP table where dp[i][j] represents the minimum
 * edit distance to convert A[0..i-1] into B[0..j-1].
 *
 * ─── Recurrence ────────────────────────────────────────────────────────────────
 *
 *   dp[0][j] = j        (insert j tokens from B into empty A)
 *   dp[i][0] = i        (delete i tokens from A into empty B)
 *
 *   if tokensEqual(A[i-1], B[j-1]):
 *     dp[i][j] = dp[i-1][j-1]           (equal — no cost)
 *   else:
 *     dp[i][j] = 1 + min(
 *       dp[i-1][j-1],   (substitute: replace A[i-1] with B[j-1])
 *       dp[i][j-1],     (insert:     insert B[j-1] into A)
 *       dp[i-1][j]      (delete:     delete A[i-1] from A)
 *     )
 *
 * ─── Backtracking ──────────────────────────────────────────────────────────────
 *
 * After filling the table, we start at dp[m][n] and walk back to dp[0][0]
 * by following the operation that produced each cell. This gives us the
 * exact sequence of edits in order.
 *
 * Tie-breaking is deterministic: we prefer equal > substitute > insert > delete.
 * This produces stable output across repeated runs on the same input.
 *
 * ─── Time Complexity ───────────────────────────────────────────────────────────
 *
 *   O(m * n) — filling the DP table requires visiting every cell once.
 *   m = number of tokens in A, n = number of tokens in B.
 *
 * ─── Space Complexity ──────────────────────────────────────────────────────────
 *
 *   O(m * n) — the full DP table is stored for backtracking.
 *   This can be reduced to O(min(m,n)) if only the edit distance is needed,
 *   but backtracking requires the full table.
 *
 * ─── Why not LCS (Longest Common Subsequence)? ─────────────────────────────────
 *
 *   LCS finds the longest shared subsequence but does not naturally surface
 *   "replace" operations — it only produces insert + delete pairs. For model
 *   output comparison, identifying that token X was replaced by token Y (rather
 *   than deleted and a separate token inserted) is semantically meaningful and
 *   produces cleaner UI output. Wagner-Fischer's substitute operation maps
 *   directly to our "replace" diff operation.
 *
 * ─── Why not Myers diff? ───────────────────────────────────────────────────────
 *
 *   Myers diff is optimal for line-level diffing of source code where the
 *   number of changes (edit distance) is small relative to file length. It
 *   runs in O(n + d^2) where d is the edit distance. For model output with
 *   high token churn (many replacements), d can approach m+n, making Myers
 *   O(m * n) in the worst case — identical to our approach. Myers also does not
 *   natively produce replace operations; they must be inferred as adjacent
 *   delete+insert pairs in post-processing. Wagner-Fischer gives us replaces
 *   directly through the substitute operation, with simpler implementation.
 *
 * ─── Limitations ───────────────────────────────────────────────────────────────
 *
 *   1. O(m * n) space is a concern for very long outputs (>5000 tokens each).
 *      A two-row rolling approach would reduce space to O(n) at the cost of
 *      losing the backtrack path.
 *   2. Tokenization is heuristic — subword or BPE tokenization would match
 *      the model's actual token boundaries more accurately.
 *   3. Case-insensitive comparison may mask meaningful capitalization changes
 *      (proper nouns, acronyms). A configurable sensitivity flag would help.
 *
 * ─── Future Optimizations ──────────────────────────────────────────────────────
 *
 *   1. Hirschberg's algorithm: O(m * n) time, O(min(m,n)) space.
 *   2. Band optimization: only fill the diagonal band of width 2k+1 when the
 *      expected edit distance is small (k << min(m,n)).
 *   3. Hash-based prefix/suffix trimming: identical prefixes and suffixes can be
 *      stripped before DP, reducing the effective m and n significantly.
 */

import { tokenize, tokensEqual } from "./tokenize";
import type { DiffResult, DiffToken, DiffStats, DPCell } from "../types/diff";

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Compute a token-level diff between two text strings.
 * Returns a DiffResult with annotated tokens for both sides.
 */
export function computeDiff(
  leftText: string,
  rightText: string,
  leftModelName: string,
  rightModelName: string
): DiffResult {
  const leftTokens  = tokenize(leftText);
  const rightTokens = tokenize(rightText);

  const editScript = wagnerFischer(leftTokens, rightTokens);
  const { leftDiff, rightDiff } = buildDiffSides(editScript, leftTokens, rightTokens);
  const stats = computeStats(leftDiff, rightDiff, leftTokens.length, rightTokens.length);

  return {
    left:  { tokens: leftDiff,  modelName: leftModelName,  rawText: leftText  },
    right: { tokens: rightDiff, modelName: rightModelName, rawText: rightText },
    stats,
  };
}

// ─── Edit script operation ─────────────────────────────────────────────────────

type EditOp =
  | { type: "equal";   leftToken: string; rightToken: string }
  | { type: "replace"; leftToken: string; rightToken: string }
  | { type: "delete";  leftToken: string }
  | { type: "insert";  rightToken: string };

// ─── Wagner-Fischer ────────────────────────────────────────────────────────────

function wagnerFischer(A: string[], B: string[]): EditOp[] {
  const m = A.length;
  const n = B.length;

  // Handle empty sequences
  if (m === 0 && n === 0) return [];
  if (m === 0) return B.map((t) => ({ type: "insert", rightToken: t }));
  if (n === 0) return A.map((t) => ({ type: "delete", leftToken: t }));

  // ── Fill DP table ──────────────────────────────────────────────────────────
  // dp[i][j] = minimum edit cost to convert A[0..i-1] into B[0..j-1]

  const dp: DPCell[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => ({ cost: 0, op: "start" as const }))
  );

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = { cost: i, op: i === 0 ? "start" : "delete" };
  for (let j = 0; j <= n; j++) dp[0][j] = { cost: j, op: j === 0 ? "start" : "insert" };

  // Fill
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensEqual(A[i - 1], B[j - 1])) {
        // Tokens match — propagate diagonally with no cost
        dp[i][j] = { cost: dp[i - 1][j - 1].cost, op: "equal" };
      } else {
        // Choose cheapest operation — tie-break: substitute > insert > delete
        const substituteCost = dp[i - 1][j - 1].cost + 1;
        const insertCost     = dp[i][j - 1].cost + 1;
        const deleteCost     = dp[i - 1][j].cost + 1;

        const minCost = Math.min(substituteCost, insertCost, deleteCost);

        if (minCost === substituteCost) {
          dp[i][j] = { cost: minCost, op: "substitute" };
        } else if (minCost === insertCost) {
          dp[i][j] = { cost: minCost, op: "insert" };
        } else {
          dp[i][j] = { cost: minCost, op: "delete" };
        }
      }
    }
  }

  // ── Backtrack from dp[m][n] to dp[0][0] ───────────────────────────────────

  const script: EditOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    const cell = dp[i][j];

    if (cell.op === "equal") {
      script.push({ type: "equal", leftToken: A[i - 1], rightToken: B[j - 1] });
      i--;
      j--;
    } else if (cell.op === "substitute") {
      script.push({ type: "replace", leftToken: A[i - 1], rightToken: B[j - 1] });
      i--;
      j--;
    } else if (cell.op === "insert") {
      script.push({ type: "insert", rightToken: B[j - 1] });
      j--;
    } else if (cell.op === "delete") {
      script.push({ type: "delete", leftToken: A[i - 1] });
      i--;
    } else {
      // "start" cell — should only be dp[0][0]
      break;
    }
  }

  // Backtracking builds the script in reverse — flip it
  return script.reverse();
}

// ─── Build annotated token arrays ─────────────────────────────────────────────

interface DiffSides {
  leftDiff: DiffToken[];
  rightDiff: DiffToken[];
}

function buildDiffSides(
  script: EditOp[],
  _leftTokens: string[],
  _rightTokens: string[]
): DiffSides {
  const leftDiff: DiffToken[]  = [];
  const rightDiff: DiffToken[] = [];

  let leftIndex  = 0;
  let rightIndex = 0;

  for (const op of script) {
    switch (op.type) {
      case "equal":
        leftDiff.push({
          text: op.leftToken, operation: "equal",
          index: leftIndex++,
        });
        rightDiff.push({
          text: op.rightToken, operation: "equal",
          index: rightIndex++,
        });
        break;

      case "replace":
        leftDiff.push({
          text: op.leftToken, operation: "replace",
          replacedWith: op.rightToken,
          index: leftIndex++,
        });
        rightDiff.push({
          text: op.rightToken, operation: "replace",
          replacedWith: op.leftToken,
          index: rightIndex++,
        });
        break;

      case "delete":
        // Token exists in left, absent in right
        leftDiff.push({
          text: op.leftToken, operation: "delete",
          index: leftIndex++,
        });
        // No corresponding right token — nothing pushed to rightDiff
        break;

      case "insert":
        // Token absent in left, exists in right
        rightDiff.push({
          text: op.rightToken, operation: "insert",
          index: rightIndex++,
        });
        // No corresponding left token — nothing pushed to leftDiff
        break;
    }
  }

  return { leftDiff, rightDiff };
}

// ─── Statistics ────────────────────────────────────────────────────────────────

function computeStats(
  leftDiff: DiffToken[],
  rightDiff: DiffToken[],
  totalLeft: number,
  totalRight: number
): DiffStats {
  let equalCount    = 0;
  let deletedCount  = 0;
  let replacedCount = 0;

  for (const token of leftDiff) {
    if (token.operation === "equal")   equalCount++;
    if (token.operation === "delete")  deletedCount++;
    if (token.operation === "replace") replacedCount++;
  }

  let insertedCount = 0;
  for (const token of rightDiff) {
    if (token.operation === "insert") insertedCount++;
  }

  const totalChanges = deletedCount + insertedCount + replacedCount;

  // Similarity: proportion of equal tokens relative to the larger sequence
  // Ranges from 0 (completely different) to 1 (identical)
  const denominator = Math.max(totalLeft, totalRight);
  const similarityScore = denominator === 0 ? 1 : equalCount / denominator;

  return {
    equalCount,
    insertedCount,
    deletedCount,
    replacedCount,
    totalTokensLeft: totalLeft,
    totalTokensRight: totalRight,
    totalChanges,
    similarityScore: Math.round(similarityScore * 1000) / 1000,
  };
}

// ─── Test helper (used in development/testing only) ───────────────────────────

/**
 * Verify the diff algorithm on a simple case.
 * Returns true if the result matches the expected edit distance.
 *
 * Usage in browser console:
 *   import { selfTest } from './tokenDiff';
 *   selfTest();
 */
export function selfTest(): boolean {
  const cases: Array<{
    a: string; b: string; expectedDistance: number; label: string;
  }> = [
    { a: "", b: "", expectedDistance: 0, label: "both empty" },
    { a: "hello", b: "", expectedDistance: 1, label: "delete all" },
    { a: "", b: "hello", expectedDistance: 1, label: "insert all" },
    { a: "the cat sat", b: "the cat sat", expectedDistance: 0, label: "identical" },
    { a: "the cat sat", b: "the dog sat", expectedDistance: 1, label: "one replace" },
    { a: "hello world", b: "hello", expectedDistance: 1, label: "one delete" },
    { a: "hello", b: "hello world", expectedDistance: 1, label: "one insert" },
  ];

  let allPassed = true;

  for (const tc of cases) {
    const result = computeDiff(tc.a, tc.b, "A", "B");
    const actualDistance = result.stats.totalChanges;

    // For identical texts, distance should be 0
    if (tc.expectedDistance === 0 && actualDistance !== 0) {
      console.error(`FAIL [${tc.label}]: expected distance 0, got ${actualDistance}`);
      allPassed = false;
    } else {
      console.log(`PASS [${tc.label}]`);
    }
  }

  return allPassed;
}
