import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { BounceIn, FadeInDown } from 'react-native-reanimated';

import { Confetti } from '@/components/game/Confetti';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors, FontSize, Radius, Spacing, playerColor } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { useGameStore } from '@/store/gameStore';

export default function FinalScreen() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config);
  const scores = useGameStore((s) => s.scores);
  const rematch = useGameStore((s) => s.rematch);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    if (phase === 'roundIntro') router.replace('/game/round-intro');
    else if (phase === 'idle') router.replace('/');
  }, [phase, router]);

  if (phase !== 'finished' || !config) return <Screen>{null}</Screen>;

  const [a, b] = scores;
  const isTie = a === b;
  const winnerIndex = a >= b ? 0 : 1;
  const winnerColor = isTie ? Colors.amber : playerColor(winnerIndex);

  return (
    <Screen>
      <Confetti />
      <View style={styles.container}>
        <Animated.View entering={BounceIn.duration(700)} style={styles.winnerBlock}>
          <AppText weight="bold" size={FontSize.lg} color={Colors.textSecondary} center>
            {AR.final.title}
          </AppText>
          <View style={[styles.trophy, { borderColor: winnerColor }]}>
            <AppText size={64} center>
              🏆
            </AppText>
          </View>
          <AppText weight="black" size={FontSize.xxl} color={winnerColor} center>
            {isTie ? AR.final.tie : AR.final.winner(config.players[winnerIndex])}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card>
            {([0, 1] as const).map((i) => (
              <View key={i} style={styles.scoreRow}>
                <AppText weight="bold" size={FontSize.lg} color={playerColor(i)}>
                  {config.players[i]}
                </AppText>
                <AppText weight="black" size={FontSize.xl}>
                  {`${toAr(scores[i])} ${AR.final.points}`}
                </AppText>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(650).duration(400)} style={styles.buttons}>
          <Button
            label={AR.final.rematch}
            big
            onPress={() => {
              rematch();
              router.replace('/game/round-intro');
            }}
          />
          <Button
            label={AR.final.newGame}
            variant="secondary"
            onPress={() => {
              reset();
              router.replace('/');
            }}
          />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-evenly' },
  winnerBlock: { alignItems: 'center', gap: Spacing.md },
  trophy: {
    borderWidth: 3,
    borderRadius: Radius.pill,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  buttons: { gap: Spacing.md },
});
