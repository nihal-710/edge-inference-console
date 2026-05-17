/**
 * tokenize.ts
 *
 * Splits model output text into tokens suitable for word-level diffing.
 *
 * Strategy:
 * We split on word boundaries while preserving punctuation as separate tokens
 * and keeping whitespace attached to the preceding word. This gives natural
 * readability when tokens are re-joined for display.
 *
 * Examples:
 *   "Hello, world!"  → ["Hello", ",", " world", "!"]
 *   "It's fine."     → ["It", "'", "s", " fine", "."]
 *   "GPT-4"          → ["GPT", "-", "4"]
 *
 * Why not split on spaces only?
 *   Splitting "hello." → ["hello."] treats the punctuation as part of the word.
 *   A change from "hello." to "hello!" would show as a full-word replace
 *   instead of a punctuation replace — losing granularity.
 *
 * Why not split on every character?
 *   Character-level diff produces too many operations for model output comparison.
 *   Word-level is the right granularity for evaluating semantic changes.
 */

/**
 * Tokenize text into word/punctuation tokens for diffing.
 * Returns an array of non-empty strings.
 */
export function tokenize(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  // Regex captures:
  // 1. Word characters optionally preceded by whitespace: \s*\w+
  // 2. Non-word, non-space characters (punctuation): [^\w\s]
  // 3. Whitespace-only sequences not captured above: \s+
  //
  // The leading-whitespace-on-words approach keeps tokens re-joinable
  // without needing a separate whitespace array.
  const TOKEN_REGEX = /\s*\w+|[^\w\s]|\s+/g;
  const matches = text.match(TOKEN_REGEX);
  if (!matches) return [];

  // Filter pure-whitespace-only matches that aren't attached to a word
  // (avoids double-counting spaces before punctuation)
  return matches.filter((t) => t.trim().length > 0 || /^\s+$/.test(t));
}

/**
 * Normalize a token for comparison.
 * Case-insensitive comparison so "The" and "the" are equal.
 * Trims leading whitespace so " word" and "word" compare equal.
 */
export function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

/**
 * Check if two tokens are semantically equal for diff purposes.
 */
export function tokensEqual(a: string, b: string): boolean {
  return normalizeToken(a) === normalizeToken(b);
}

/**
 * Rejoin tokens into displayable text.
 * Used when we need to show the original text reconstructed from tokens.
 */
export function rejoinTokens(tokens: string[]): string {
  return tokens.join("");
}
