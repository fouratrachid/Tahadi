import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { AR } from '@/i18n/ar';
import { selectChallenge, useGameStore } from '@/store/gameStore';

export default function RoundIntroScreen() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);
  const roundIndex = useGameStore((s) => s.roundIndex);
  const config = useGameStore((s) => s.config);
  const challenge = useGameStore(selectChallenge);
  const startRound = useGameStore((s) => s.startRound);

  if (phase !== 'roundIntro' || !config || !challenge) {
    return <Screen>{null}</Screen>;
  }

  const info = AR.challenges[challenge];
  const total = config.challenges.length;

  return (
    <Screen>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <AppText weight="bold" size={FontSize.md} color={Colors.amber} center>
            {AR.roundIntro.round(roundIndex + 1, total)}
          </AppText>
          <AppText weight="black" size={FontSize.huge} center style={{ marginTop: Spacing.sm }}>
            {info.name}
          </AppText>
          <AppText weight="medium" size={FontSize.md} color={Colors.textSecondary} center>
            {info.short}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card accent={Colors.accent}>
            <AppText weight="bold" size={FontSize.sm} color={Colors.accent} style={{ marginBottom: Spacing.sm }}>
              {AR.roundIntro.refereeRead}
            </AppText>
            <AppText size={FontSize.lg} style={{ lineHeight: 34 }}>
              {info.rules}
            </AppText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Button
            label={AR.roundIntro.begin}
            big
            onPress={() => {
              startRound();
              router.replace('/game/play');
            }}
          />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-evenly' },
});
