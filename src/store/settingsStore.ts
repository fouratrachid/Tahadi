/**
 * Settings store: sound + haptics toggles, persisted to AsyncStorage and mirrored
 * into the sound/haptics managers so the store and screens can fire effects.
 */

import { create } from 'zustand';

import { setHapticsEnabled } from '@/lib/haptics';
import { setSoundEnabled } from '@/lib/soundManager';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/lib/storage';
import type { Settings } from '@/types';

interface SettingsState extends Settings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSound: (value: boolean) => void;
  setHaptics: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,

  hydrate: async () => {
    const settings = await loadSettings();
    setSoundEnabled(settings.sound);
    setHapticsEnabled(settings.haptics);
    set({ ...settings, hydrated: true });
  },

  setSound: (value) => {
    setSoundEnabled(value);
    set({ sound: value });
    void saveSettings({ sound: value, haptics: get().haptics });
  },

  setHaptics: (value) => {
    setHapticsEnabled(value);
    set({ haptics: value });
    void saveSettings({ sound: get().sound, haptics: value });
  },
}));
