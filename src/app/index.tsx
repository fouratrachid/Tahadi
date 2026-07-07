import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { AR } from '@/i18n/ar';
import { useGameStore } from '@/store/gameStore';

export default function HomeScreen() {
  const router = useRouter();
  const reset = useGameStore((s) => s.reset);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.logo}>
          <View style={styles.badge}>
            <AppText weight="black" size={80} color={Colors.accent} center>
              {AR.appName}
            </AppText>
          </View>
          <AppText weight="bold" size={FontSize.lg} color={Colors.text} center>
            {AR.tagline}
          </AppText>
          <AppText weight="medium" size={FontSize.sm} color={Colors.textSecondary} center>
            {AR.home.subtitle}
          </AppText>
        </View>

        <View style={styles.buttons}>
          <Button
            label={AR.home.newGame}
            big
            onPress={() => {
              reset();
              router.push('/setup');
            }}
          />
          <Button label={AR.home.packs} variant="secondary" onPress={() => router.push('/packs')} />
          <Button
            label={AR.home.history}
            variant="secondary"
            onPress={() => router.push('/history')}
          />
          <Button
            label={AR.home.settings}
            variant="ghost"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: Spacing.xxxl },
  logo: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xxxl },
  badge: {
    borderWidth: 3,
    borderColor: Colors.accent,
    borderRadius: 28,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  buttons: { gap: Spacing.md, marginBottom: Spacing.xl },
});
