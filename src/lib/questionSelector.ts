/**
 * Pure, testable question-selection logic.
 *
 * Given a pool of candidate questions (already filtered by category +
 * challenge type), select `count` random questions that were not used before,
 * never repeating within a single selection. If there are not enough unused
 * questions, the pack is considered exhausted: we reset and draw a fresh random
 * set from the whole pool, signalling the caller to clear its persisted
 * used-id record for that pack.
 *
 * RNG is injectable so selection is deterministic in unit tests.
 */

import type { Question } from '@/types';

export type Rng = () => number;

export interface SelectionResult {
  selected: Question[];
  /** True when the pool ran out of unused questions and was reset. */
  exhausted: boolean;
}

/** Fisher–Yates shuffle producing a new array; does not mutate input. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function selectQuestions(
  pool: readonly Question[],
  count: number,
  usedIds: ReadonlySet<string>,
  rng: Rng = Math.random,
): SelectionResult {
  const wanted = Math.max(0, Math.floor(count));
  if (wanted === 0 || pool.length === 0) {
    return { selected: [], exhausted: false };
  }

  const available = pool.filter((q) => !usedIds.has(q.id));

  if (available.length >= wanted) {
    return { selected: shuffle(available, rng).slice(0, wanted), exhausted: false };
  }

  // Not enough unused questions: reset this pack and draw from the full pool.
  // (If the whole pool is smaller than `wanted`, we return everything.)
  const selected = shuffle(pool, rng).slice(0, Math.min(wanted, pool.length));
  return { selected, exhausted: true };
}
