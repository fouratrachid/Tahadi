import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors, FontSize, Radius, Spacing, playerColor } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { selectRoundDelta, useGameStore } from '@/store/gameStore';
import type { PlayerIndex } from '@/types';

function ScoreBar({
  index,
  name,
  delta,
  total,
  maxScore,
  delay,
}: {
  index: PlayerIndex;
  name: string;
  delta: number;
  total: number;
  maxScore: number;
  delay: number;
}) {
  const width = useSharedValue(0);
  const fraction = maxScore > 0 ? total / maxScore : 0;

  useEffect(() => {
    width.value = withDelay(delay, withTiming(fraction, { duration: 700 }));
  }, [width, fraction, delay]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.max(6, width.value * 100)}%`,
  }));

  const color = playerColor(index);
  return (
    <View style={styles.barBlock}>
      <View style={styles.barLabelRow}>
        <AppText weight="bold" size={FontSize.md}>
          {name}
        </AppText>
        <AppText weight="bold" size={FontSize.sm} color={color}>
          {`+${toAr(delta)}`}
        </AppText>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { backgroundColor: color }, barStyle]}>
          <AppText weight="black" size={FontSize.sm} color={Colors.bg}>
            {toAr(total)}
          </AppText>
        </Animated.View>
      </View>
    </View>
  );
}

export default function RoundResultScreen() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config);
  const scores = useGameStore((s) => s.scores);
  const roundIndex = useGameStore((s) => s.roundIndex);
  const delta = useGameStore(selectRoundDelta);
  const nextRound = useGameStore((s) => s.nextRound);

  useEffect(() => {
    if (phase === 'finished') router.replace('/game/final');
    else if (phase === 'roundIntro') router.replace('/game/round-intro');
    else if (phase === 'idle') router.replace('/');
  }, [phase, router]);

  if (phase !== 'roundResult' || !config) return <Screen>{null}</Screen>;

  const isLastRound = roundIndex + 1 >= config.challenges.length;
  const maxScore = Math.max(scores[0], scores[1], 1);

  return (
    <Screen>
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <AppText weight="bold" size={FontSize.md} color={Colors.amber} center>
            {AR.roundIntro.round(roundIndex + 1, config.challenges.length)}
          </AppText>
          <AppText weight="black" size={FontSize.xxl} center>
            {AR.roundResult.title}
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Card>
            <AppText
              weight="bold"
              size={FontSize.sm}
              color={Colors.textSecondary}
              style={{ marginBottom: Spacing.lg }}
            >
              {`${AR.roundResult.roundPoints} · ${AR.roundResult.total}`}
            </AppText>
            <ScoreBar
              index={0}
              name={config.players[0]}
              delta={delta[0]}
              total={scores[0]}
              maxScore={maxScore}
              delay={200}
            />
            <ScoreBar
              index={1}
              name={config.players[1]}
              delta={delta[1]}
              total={scores[1]}
              maxScore={maxScore}
              delay={400}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Button
            label={isLastRound ? AR.roundResult.finish : AR.roundResult.next}
            big
            onPress={nextRound}
          />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-evenly' },
  barBlock: { marginBottom: Spacing.lg },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  barTrack: {
    height: 40,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
});
