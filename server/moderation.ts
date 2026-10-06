export type ModerationResult = {
  approved: boolean;
  reason: string | null;
};

const blockedPatterns: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\bspam\b/i, reason: "Conteúdo identificado como spam." },
  { pattern: /\bscam\b/i, reason: "Conteúdo identificado como tentativa de fraude." },
  { pattern: /\bfraude\b/i, reason: "Conteúdo identificado como tentativa de fraude." },
  { pattern: /(.)\1{7,}/i, reason: "Conteúdo com repetição excessiva de caracteres." },
];

/**
 * Lightweight, deterministic first-pass moderation.
 * The final decision remains editable by a clinic administrator.
 */
export function moderateCommentText(text: string): ModerationResult {
  const normalized = text.trim();
  const match = blockedPatterns.find(({ pattern }) => pattern.test(normalized));

  return match
    ? { approved: false, reason: match.reason }
    : { approved: true, reason: null };
}
