/**
 * Sound-effect manager built on expo-audio's imperative API so effects can be
 * fired from the store (outside React). Players are preloaded once and replayed
 * by seeking to 0. Respects the sound setting.
 */

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  timeUp: require('../../assets/sounds/timeup.wav'),
  roundWin: require('../../assets/sounds/roundwin.wav'),
  gameWin: require('../../assets/sounds/gamewin.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

let players: Partial<Record<SoundName, AudioPlayer>> = {};
let enabled = true;
let initialized = false;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export async function initSound(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    // non-fatal
  }
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
    } catch {
      // ignore individual load failures
    }
  });
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  const player = players[name];
  if (!player) return;
  try {
    // Restart from the beginning for rapid re-triggering (e.g. tick).
    void player.seekTo(0);
    player.play();
  } catch {
    // ignore playback errors
  }
}

export function unloadSound(): void {
  Object.values(players).forEach((player) => {
    try {
      player?.remove();
    } catch {
      // ignore
    }
  });
  players = {};
  initialized = false;
}
