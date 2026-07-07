import {
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_900Black,
  useFonts,
} from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { initSound } from '@/lib/soundManager';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';

// The app is Arabic — force RTL layout from the very first screen.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_900Black,
  });

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateGame = useGameStore((s) => s.hydrate);

  useEffect(() => {
    void initSound();
    void hydrateSettings();
    void hydrateGame();
  }, [hydrateSettings, hydrateGame]);

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
