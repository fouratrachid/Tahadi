/**
 * AsyncStorage persistence: settings, game history, and used-question ids.
 * All reads are defensive (corrupt/missing data returns a safe default).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameRecord, Settings, UsedIdsByPack } from '@/types';

const KEYS = {
  settings: '@tahadi/settings',
  history: '@tahadi/history',
  usedIds: '@tahadi/usedIds',
} as const;

const HISTORY_LIMIT = 20;

export const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true };

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures; persistence is best-effort.
  }
}

// ---- Settings ----------------------------------------------------------------

export async function loadSettings(): Promise<Settings> {
  const s = await readJson<Partial<Settings>>(KEYS.settings, DEFAULT_SETTINGS);
  return {
    sound: typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound,
    haptics: typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeJson(KEYS.settings, settings);
}

// ---- History -----------------------------------------------------------------

export async function loadHistory(): Promise<GameRecord[]> {
  const list = await readJson<GameRecord[]>(KEYS.history, []);
  return Array.isArray(list) ? list : [];
}

/** Prepend a record and keep only the most recent HISTORY_LIMIT games. */
export async function addHistory(record: GameRecord): Promise<GameRecord[]> {
  const current = await loadHistory();
  const next = [record, ...current].slice(0, HISTORY_LIMIT);
  await writeJson(KEYS.history, next);
  return next;
}

export async function clearHistory(): Promise<void> {
  await writeJson(KEYS.history, []);
}

// ---- Used question ids -------------------------------------------------------

export async function loadUsedIds(): Promise<UsedIdsByPack> {
  const map = await readJson<UsedIdsByPack>(KEYS.usedIds, {});
  return map && typeof map === 'object' ? map : {};
}

export async function saveUsedIds(map: UsedIdsByPack): Promise<void> {
  await writeJson(KEYS.usedIds, map);
}

export async function clearUsedIds(): Promise<void> {
  await writeJson(KEYS.usedIds, {});
}
