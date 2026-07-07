import { CATEGORIES, CHALLENGE_TYPES, getPack, getPool } from '../packs';
import type { ChallengeType } from '@/types';

/** Spec minimums per category per challenge type. */
const MINIMUMS: Record<ChallengeType, number> = {
  speed: 60,
  whoAmI: 15,
  reversed: 40,
  ordering: 15,
  bell: 40,
};

describe('question packs content', () => {
  it('meets the minimum question counts for every pack', () => {
    for (const category of CATEGORIES) {
      for (const challenge of CHALLENGE_TYPES) {
        const pack = getPack(category, challenge);
        expect(pack.length).toBeGreaterThanOrEqual(MINIMUMS[challenge]);
      }
    }
  });

  it('has globally unique question ids', () => {
    const all = CATEGORIES.flatMap((c) => CHALLENGE_TYPES.flatMap((ch) => getPack(c, ch)));
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('tags every question with its own pack category and challenge type', () => {
    for (const category of CATEGORIES) {
      for (const challenge of CHALLENGE_TYPES) {
        for (const q of getPack(category, challenge)) {
          expect(q.category).toBe(category);
          expect(q.challengeType).toBe(challenge);
          expect(q.text.trim().length).toBeGreaterThan(0);
          expect(q.answer.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('whoAmI questions have exactly 4 hints', () => {
    for (const category of CATEGORIES) {
      for (const q of getPack(category, 'whoAmI')) {
        expect(q.hints).toHaveLength(4);
      }
    }
  });

  it('ordering questions have 4–5 items', () => {
    for (const category of CATEGORIES) {
      for (const q of getPack(category, 'ordering')) {
        expect(q.items!.length).toBeGreaterThanOrEqual(4);
        expect(q.items!.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it('merges pools across categories', () => {
    const single = getPool(['football'], 'speed').length;
    const merged = getPool(['football', 'anime'], 'speed').length;
    expect(merged).toBeGreaterThan(single);
  });

  it('contains no leftover drafting artifacts in question texts', () => {
    for (const category of CATEGORIES) {
      for (const challenge of CHALLENGE_TYPES) {
        for (const q of getPack(category, challenge)) {
          expect(q.text).not.toContain('...');
          expect(q.text).not.toMatch(/بل[::]| بل /);
        }
      }
    }
  });
});
