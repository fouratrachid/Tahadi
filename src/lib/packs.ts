/**
 * Bundled question packs. Each pack is a JSON array of Questions shipped in
 * assets/packs/{category}.{challengeType}.json. Metro requires them statically
 * at build time, so there are no network calls — the game is fully offline.
 */

import type { Category, ChallengeType, Question } from '@/types';

export const CATEGORIES: Category[] = ['football', 'anime', 'movies', 'general'];
export const CHALLENGE_TYPES: ChallengeType[] = [
  'speed',
  'whoAmI',
  'reversed',
  'ordering',
  'bell',
];

export function packKey(category: Category, challenge: ChallengeType): string {
  return `${category}.${challenge}`;
}

// Static require map — one entry per {category}.{challengeType}.
// Relative requires keep Metro resolution unambiguous.
const RAW: Record<string, unknown> = {
  'football.speed': require('../../assets/packs/football.speed.json'),
  'football.whoAmI': require('../../assets/packs/football.whoAmI.json'),
  'football.reversed': require('../../assets/packs/football.reversed.json'),
  'football.ordering': require('../../assets/packs/football.ordering.json'),
  'football.bell': require('../../assets/packs/football.bell.json'),

  'anime.speed': require('../../assets/packs/anime.speed.json'),
  'anime.whoAmI': require('../../assets/packs/anime.whoAmI.json'),
  'anime.reversed': require('../../assets/packs/anime.reversed.json'),
  'anime.ordering': require('../../assets/packs/anime.ordering.json'),
  'anime.bell': require('../../assets/packs/anime.bell.json'),

  'movies.speed': require('../../assets/packs/movies.speed.json'),
  'movies.whoAmI': require('../../assets/packs/movies.whoAmI.json'),
  'movies.reversed': require('../../assets/packs/movies.reversed.json'),
  'movies.ordering': require('../../assets/packs/movies.ordering.json'),
  'movies.bell': require('../../assets/packs/movies.bell.json'),

  'general.speed': require('../../assets/packs/general.speed.json'),
  'general.whoAmI': require('../../assets/packs/general.whoAmI.json'),
  'general.reversed': require('../../assets/packs/general.reversed.json'),
  'general.ordering': require('../../assets/packs/general.ordering.json'),
  'general.bell': require('../../assets/packs/general.bell.json'),
};

const PACKS: Record<string, Question[]> = Object.fromEntries(
  Object.entries(RAW).map(([key, value]) => [key, value as Question[]]),
);

/** All questions for one pack. */
export function getPack(category: Category, challenge: ChallengeType): Question[] {
  return PACKS[packKey(category, challenge)] ?? [];
}

/** Merged pool across the selected categories for one challenge type. */
export function getPool(
  categories: readonly Category[],
  challenge: ChallengeType,
): Question[] {
  const pool: Question[] = [];
  for (const category of categories) {
    const pack = PACKS[packKey(category, challenge)];
    if (pack) pool.push(...pack);
  }
  return pool;
}

export interface PackCount {
  category: Category;
  challenge: ChallengeType;
  count: number;
}

/** Question counts per (category, challenge) for the packs browser. */
export function packCounts(): PackCount[] {
  const out: PackCount[] = [];
  for (const category of CATEGORIES) {
    for (const challenge of CHALLENGE_TYPES) {
      out.push({ category, challenge, count: getPack(category, challenge).length });
    }
  }
  return out;
}

export function categoryTotal(category: Category): number {
  return CHALLENGE_TYPES.reduce((sum, c) => sum + getPack(category, c).length, 0);
}

export function grandTotal(): number {
  return CATEGORIES.reduce((sum, cat) => sum + categoryTotal(cat), 0);
}
