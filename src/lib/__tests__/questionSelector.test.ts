import type { Question } from '@/types';

import { selectQuestions, shuffle } from '../questionSelector';

function makePool(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q-${i}`,
    category: 'football',
    challengeType: 'speed',
    text: `سؤال ${i}`,
    answer: `جواب ${i}`,
  }));
}

// Deterministic RNG for reproducible tests.
function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = makePool(20);
    const copy = input.slice();
    const out = shuffle(input, seededRng(42));
    expect(input).toEqual(copy);
    expect(out).toHaveLength(20);
    expect(new Set(out.map((q) => q.id)).size).toBe(20);
  });

  it('is deterministic for a fixed seed', () => {
    const pool = makePool(10);
    const a = shuffle(pool, seededRng(7)).map((q) => q.id);
    const b = shuffle(pool, seededRng(7)).map((q) => q.id);
    expect(a).toEqual(b);
  });
});

describe('selectQuestions', () => {
  it('selects the requested count with no duplicates', () => {
    const pool = makePool(50);
    const { selected, exhausted } = selectQuestions(pool, 10, new Set(), seededRng(1));
    expect(selected).toHaveLength(10);
    expect(exhausted).toBe(false);
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
  });

  it('never returns used questions when enough remain', () => {
    const pool = makePool(30);
    const used = new Set(pool.slice(0, 15).map((q) => q.id));
    const { selected, exhausted } = selectQuestions(pool, 15, used, seededRng(2));
    expect(exhausted).toBe(false);
    expect(selected).toHaveLength(15);
    for (const q of selected) expect(used.has(q.id)).toBe(false);
  });

  it('signals exhaustion and resets when unused questions run out', () => {
    const pool = makePool(20);
    const used = new Set(pool.slice(0, 15).map((q) => q.id)); // only 5 unused
    const { selected, exhausted } = selectQuestions(pool, 10, used, seededRng(3));
    expect(exhausted).toBe(true);
    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
  });

  it('caps the selection at pool size when the pool is tiny', () => {
    const pool = makePool(4);
    const { selected, exhausted } = selectQuestions(pool, 10, new Set(), seededRng(4));
    expect(exhausted).toBe(true);
    expect(selected).toHaveLength(4);
  });

  it('handles empty pools and zero counts', () => {
    expect(selectQuestions([], 5, new Set()).selected).toHaveLength(0);
    expect(selectQuestions(makePool(5), 0, new Set()).selected).toHaveLength(0);
  });

  it('never selects hard-excluded ids, even when exhausted', () => {
    const pool = makePool(20);
    const hard = new Set(pool.slice(0, 10).map((q) => q.id));
    const soft = new Set(pool.slice(10, 18).map((q) => q.id)); // 2 fresh left
    const { selected, exhausted } = selectQuestions(pool, 10, soft, seededRng(5), hard);
    expect(exhausted).toBe(true);
    expect(selected).toHaveLength(10); // 2 fresh + 8 reused soft
    for (const q of selected) expect(hard.has(q.id)).toBe(false);
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
  });

  it('prefers fresh questions before reusing soft-used ones', () => {
    const pool = makePool(12);
    const soft = new Set(pool.slice(0, 9).map((q) => q.id)); // 3 fresh
    const { selected, exhausted } = selectQuestions(pool, 5, soft, seededRng(6));
    expect(exhausted).toBe(true);
    const freshPicked = selected.filter((q) => !soft.has(q.id));
    expect(freshPicked).toHaveLength(3); // every fresh question is included
  });
});
