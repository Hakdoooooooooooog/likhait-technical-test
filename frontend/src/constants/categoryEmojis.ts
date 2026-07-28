export const CATEGORY_EMOJI_POOL = [
  "🍔",
  "🚗",
  "🎬",
  "🛍️",
  "📄",
  "🏥",
  "📚",
  "✈️",
  "📦",
  "💼",
  "🧾",
  "🛠️",
] as const;

export const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍔",
  transportation: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  bills: "📄",
  healthcare: "🏥",
  education: "📚",
  travel: "✈️",
  personal: "👤",
  other: "📦",
};

/**
 * Generates a consistent 32-bit integer hash from a string.
 */
function hashCategory(category: string): number {
  let hash = 0;
  for (let index = 0; index < category.length; index += 1) {
    hash = (hash * 31 + category.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/**
 * Returns an emoji for a category. Checks explicit dictionary first,
 * then falls back to a deterministic hash from the pool.
 */
export function getCategoryEmoji(category: string): string {
  if (!category) return "📦";

  const normalized = category.trim().toLowerCase();

  // 1. Direct dictionary match
  if (normalized in CATEGORY_EMOJIS) {
    return CATEGORY_EMOJIS[normalized];
  }

  // 2. Deterministic hash fallback for unknown/custom categories
  const poolIndex = hashCategory(normalized) % CATEGORY_EMOJI_POOL.length;
  return CATEGORY_EMOJI_POOL[poolIndex];
}
