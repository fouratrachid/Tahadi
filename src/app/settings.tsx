import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { hapticSuccess } from '@/lib/haptics';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const sound = useSettingsStore((s) => s.sound);
  const haptics = useSettingsStore((s) => s.haptics);
  const setSound = useSettingsStore((s) => s.setSound);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const resetUsed = useGameStore((s) => s.resetUsed);
  const [resetDone, setResetDone] = useState(false);

  return (
    <Screen scroll>
      <ScreenHeader title={AR.settings.title} />

      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText weight="bold" size={FontSize.md}>
            {AR.settings.sound}
          </AppText>
          <Switch
            value={sound}
            onValueChange={setSound}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.accentDark }}
            thumbColor={sound ? Colors.accent : Colors.textMuted}
          />
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <AppText weight="bold" size={FontSize.md}>
            {AR.settings.haptics}
          </AppText>
          <Switch
            value={haptics}
            onValueChange={setHaptics}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.accentDark }}
            thumbColor={haptics ? Colors.accent : Colors.textMuted}
          />
        </View>
      </Card>

      <Button
        label={resetDone ? AR.settings.resetUsedDone : AR.settings.resetUsed}
        variant="secondary"
        onPress={() => {
          resetUsed();
          hapticSuccess();
          setResetDone(true);
        }}
        style={{ marginBottom: Spacing.xl }}
      />

      <Card>
        <AppText size={FontSize.sm} color={Colors.textSecondary} center>
          {AR.settings.about}
        </AppText>
        <AppText
          size={FontSize.xs}
          color={Colors.textMuted}
          center
          style={{ marginTop: Spacing.sm }}
        >
          {`${AR.settings.version} ${toAr(Constants.expoConfig?.version ?? '1.0.0')}`}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
});
