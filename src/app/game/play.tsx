import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CountdownRing } from '@/components/game/CountdownRing';
import { ScoreHeader } from '@/components/game/ScoreHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Colors, FontSize, Radius, Spacing, TOUCH_MIN, playerColor } from '@/constants/theme';
import { useGameTimer } from '@/hooks/useGameTimer';
import { AR, toAr } from '@/i18n/ar';
import { reverseGraphemes } from '@/lib/grapheme';
import { shuffle } from '@/lib/questionSelector';
import { playSound } from '@/lib/soundManager';
import {
  selectActivePlayer,
  selectChallenge,
  selectCurrentQuestion,
  selectIsTimed,
  selectProgress,
  useGameStore,
} from '@/store/gameStore';

export default function PlayScreen() {
  useKeepAwake();
  const router = useRouter();

  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config);
  const scores = useGameStore((s) => s.scores);
  const challenge = useGameStore(selectChallenge);
  const question = useGameStore(selectCurrentQuestion);
  const activePlayer = useGameStore(selectActivePlayer);
  const progress = useGameStore(selectProgress);
  const roundIndex = useGameStore((s) => s.roundIndex);
  const turnEndsAt = useGameStore((s) => s.turnEndsAt);
  const isPaused = useGameStore((s) => s.isPaused);
  const revealedHints = useGameStore((s) => s.revealedHints);
  const orderingRevealed = useGameStore((s) => s.orderingRevealed);
  const isTimed = useGameStore(selectIsTimed);

  const answerCorrect = useGameStore((s) => s.answerCorrect);
  const answerWrong = useGameStore((s) => s.answerWrong);
  const skipQuestion = useGameStore((s) => s.skipQuestion);
  const revealHint = useGameStore((s) => s.revealHint);
  const revealOrder = useGameStore((s) => s.revealOrder);
  const awardBell = useGameStore((s) => s.awardBell);
  const startTurn = useGameStore((s) => s.startTurn);
  const endTurn = useGameStore((s) => s.endTurn);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);

  // Navigate out when the round ends.
  useEffect(() => {
    if (phase === 'roundResult') router.replace('/game/round-result');
    else if (phase === 'idle') router.replace('/');
  }, [phase, router]);

  // Pause the timer automatically when the app is backgrounded mid-turn.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pause();
    });
    return () => sub.remove();
  }, [pause]);

  const durationMs = (config?.timerSec ?? 30) * 1000;
  const timerRunning = phase === 'playing' && isTimed && !isPaused && turnEndsAt != null;

  const { progress: ringProgress, secondsLeft } = useGameTimer({
    endsAt: turnEndsAt,
    durationMs,
    running: timerRunning,
    onExpire: () => {
      playSound('timeUp');
      endTurn();
    },
    onTick: () => playSound('tick'),
  });

  // Shuffled display order for the ordering challenge, stable per question.
  const shuffledItems = useMemo(() => {
    if (!question?.items) return [];
    return shuffle(question.items);
  }, [question]);

  if (!config || !challenge) return <Screen>{null}</Screen>;

  const names = config.players;

  // Between-turns interstitial: player 2 gets ready for their timed turn.
  if (phase === 'betweenTurns') {
    return (
      <Screen>
        <View style={styles.betweenWrap}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.betweenCard}>
            <AppText weight="bold" size={FontSize.lg} color={Colors.amber} center>
              {AR.play.timeUp}
            </AppText>
            <AppText weight="black" size={FontSize.xxl} center>
              {AR.play.getReady(names[1])}
            </AppText>
          </Animated.View>
          <Button label={AR.play.nextPlayer} big onPress={() => startTurn(1)} />
        </View>
      </Screen>
    );
  }

  if (phase !== 'playing' || !question) return <Screen>{null}</Screen>;

  return (
    <Screen contentStyle={styles.playContent}>
      {/* Header: scores + round info + pause */}
      <ScoreHeader
        names={names}
        scores={scores}
        activePlayer={activePlayer}
        centerTop={AR.challenges[challenge].name}
        centerBottom={AR.roundIntro.round(roundIndex + 1, config.challenges.length)}
      />

      <View style={styles.metaRow}>
        <Pressable onPress={isPaused ? resume : pause} style={styles.pauseBtn} hitSlop={8}>
          <AppText weight="bold" size={FontSize.sm} color={Colors.amber}>
            {isPaused ? AR.play.resume : AR.play.pause}
          </AppText>
        </Pressable>
        <AppText weight="bold" size={FontSize.sm} color={Colors.textSecondary}>
          {AR.play.questionOf(progress.index, progress.total)}
        </AppText>
        {activePlayer != null ? (
          <AppText weight="bold" size={FontSize.sm} color={playerColor(activePlayer)}>
            {AR.play.turnOf(names[activePlayer])}
          </AppText>
        ) : (
          <AppText weight="bold" size={FontSize.sm} color={Colors.accent}>
            {AR.challenges.bell.short}
          </AppText>
        )}
      </View>

      {/* Timer for timed challenges */}
      {isTimed ? (
        <View style={styles.timerWrap}>
          <CountdownRing progress={ringProgress} seconds={secondsLeft} size={150} />
        </View>
      ) : null}

      {/* Question area (dimmed while paused) */}
      <View style={[styles.questionWrap, isPaused && styles.dimmed]}>
        <QuestionArea
          challenge={challenge}
          questionText={question.text}
          answer={question.answer}
          hints={question.hints ?? []}
          items={question.items ?? []}
          shuffledItems={shuffledItems}
          revealedHints={revealedHints}
          orderingRevealed={orderingRevealed}
        />
      </View>

      {isPaused ? (
        <View style={styles.pausedBanner}>
          <AppText weight="black" size={FontSize.lg} color={Colors.amber} center>
            {AR.play.paused}
          </AppText>
        </View>
      ) : null}

      {/* Referee controls */}
      <View style={styles.controls} pointerEvents={isPaused ? 'none' : 'auto'}>
        <Controls
          challenge={challenge}
          names={names}
          revealedHints={revealedHints}
          orderingRevealed={orderingRevealed}
          onCorrect={answerCorrect}
          onWrong={answerWrong}
          onSkip={skipQuestion}
          onRevealHint={revealHint}
          onRevealOrder={revealOrder}
          onBell={awardBell}
        />
      </View>
    </Screen>
  );
}

// ---- Question area per challenge ---------------------------------------------

function QuestionArea({
  challenge,
  questionText,
  answer,
  hints,
  items,
  shuffledItems,
  revealedHints,
  orderingRevealed,
}: {
  challenge: NonNullable<ReturnType<typeof selectChallenge>>;
  questionText: string;
  answer: string;
  hints: string[];
  items: string[];
  shuffledItems: string[];
  revealedHints: number;
  orderingRevealed: boolean;
}) {
  if (challenge === 'whoAmI') {
    return (
      <Card style={styles.qCard}>
        {hints.slice(0, revealedHints).map((hint, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(300)} style={styles.hintRow}>
            <View style={styles.hintBadge}>
              <AppText weight="black" size={FontSize.sm} color={Colors.bg}>
                {toAr(i + 1)}
              </AppText>
            </View>
            <AppText size={FontSize.lg} style={styles.hintText}>
              {hint}
            </AppText>
          </Animated.View>
        ))}
        <View style={styles.answerRow}>
          <AppText weight="bold" size={FontSize.sm} color={Colors.amber}>
            {`${AR.play.answerLabel}: ${answer}`}
          </AppText>
        </View>
      </Card>
    );
  }

  if (challenge === 'reversed') {
    return (
      <Card style={styles.qCard}>
        <AppText weight="black" size={FontSize.xxl} center style={styles.reversedWord}>
          {reverseGraphemes(questionText)}
        </AppText>
        <View style={styles.answerRow}>
          <AppText weight="bold" size={FontSize.sm} color={Colors.amber} center>
            {`${AR.play.answerLabel}: ${answer}`}
          </AppText>
        </View>
      </Card>
    );
  }

  if (challenge === 'ordering') {
    const display = orderingRevealed ? items : shuffledItems;
    return (
      <Card style={styles.qCard}>
        <AppText weight="bold" size={FontSize.lg} center style={{ marginBottom: Spacing.md }}>
          {questionText}
        </AppText>
        {orderingRevealed ? (
          <AppText weight="bold" size={FontSize.sm} color={Colors.accent} center style={{ marginBottom: Spacing.sm }}>
            {AR.play.correctOrder}
          </AppText>
        ) : null}
        {display.map((item, i) => (
          <Animated.View key={`${orderingRevealed}-${i}`} entering={FadeIn.delay(i * 60)} style={styles.orderRow}>
            {orderingRevealed ? (
              <View style={[styles.hintBadge, { backgroundColor: Colors.accent }]}>
                <AppText weight="black" size={FontSize.sm} color={Colors.bg}>
                  {toAr(i + 1)}
                </AppText>
              </View>
            ) : null}
            <AppText size={FontSize.md} weight="medium" style={styles.hintText}>
              {item}
            </AppText>
          </Animated.View>
        ))}
      </Card>
    );
  }

  // speed & bell: plain large question + referee answer
  return (
    <Card style={styles.qCard}>
      <AppText weight="bold" size={FontSize.xl} center style={{ lineHeight: 42 }}>
        {questionText}
      </AppText>
      <View style={styles.answerRow}>
        <AppText weight="bold" size={FontSize.sm} color={Colors.amber} center>
          {`${AR.play.answerLabel}: ${answer}`}
        </AppText>
      </View>
    </Card>
  );
}

// ---- Referee controls per challenge --------------------------------------------

function Controls({
  challenge,
  names,
  revealedHints,
  orderingRevealed,
  onCorrect,
  onWrong,
  onSkip,
  onRevealHint,
  onRevealOrder,
  onBell,
}: {
  challenge: NonNullable<ReturnType<typeof selectChallenge>>;
  names: [string, string];
  revealedHints: number;
  orderingRevealed: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
  onRevealHint: () => void;
  onRevealOrder: () => void;
  onBell: (player: 0 | 1 | null) => void;
}) {
  if (challenge === 'bell') {
    return (
      <View style={styles.controlCol}>
        <AppText weight="bold" size={FontSize.sm} color={Colors.textSecondary} center>
          {AR.play.whoAnswered}
        </AppText>
        <View style={styles.controlRow}>
          <Button
            label={names[0]}
            style={{ ...styles.flex1, backgroundColor: playerColor(0) }}
            fullWidth={false}
            onPress={() => onBell(0)}
          />
          <Button
            label={names[1]}
            style={{ ...styles.flex1, backgroundColor: playerColor(1) }}
            fullWidth={false}
            onPress={() => onBell(1)}
          />
        </View>
        <Button label={AR.play.noOne} variant="secondary" onPress={() => onBell(null)} />
      </View>
    );
  }

  if (challenge === 'whoAmI') {
    return (
      <View style={styles.controlCol}>
        {revealedHints < 4 ? (
          <Button
            label={`${AR.play.revealHint} (${toAr(revealedHints + 1)}/${toAr(4)})`}
            variant="amber"
            onPress={onRevealHint}
          />
        ) : null}
        <View style={styles.controlRow}>
          <Button label={`✗ ${AR.play.wrong}`} variant="danger" style={styles.flex1} fullWidth={false} onPress={onWrong} />
          <Button
            label={`✓ ${AR.play.correct} +${toAr([40, 30, 20, 10][revealedHints - 1] ?? 10)}`}
            style={styles.flex1}
            fullWidth={false}
            onPress={onCorrect}
          />
        </View>
      </View>
    );
  }

  if (challenge === 'ordering') {
    if (!orderingRevealed) {
      return (
        <View style={styles.controlCol}>
          <Button label={AR.play.revealOrder} variant="amber" onPress={onRevealOrder} />
        </View>
      );
    }
    return (
      <View style={styles.controlCol}>
        <AppText weight="bold" size={FontSize.sm} color={Colors.textSecondary} center>
          {AR.play.judgePrompt}
        </AppText>
        <View style={styles.controlRow}>
          <Button label={`✗ ${AR.play.wrong}`} variant="danger" style={styles.flex1} fullWidth={false} onPress={onWrong} />
          <Button label={`✓ ${AR.play.correct}`} style={styles.flex1} fullWidth={false} onPress={onCorrect} />
        </View>
      </View>
    );
  }

  // speed & reversed: fast ✓ / ✗ / skip
  return (
    <View style={styles.controlCol}>
      <View style={styles.controlRow}>
        <Button label={`✗ ${AR.play.wrong}`} variant="danger" style={styles.flex1} fullWidth={false} big onPress={onWrong} />
        <Button label={`✓ ${AR.play.correct}`} style={styles.flex1} fullWidth={false} big onPress={onCorrect} />
      </View>
      <Button label={AR.play.skip} variant="secondary" onPress={onSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  playContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  pauseBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 34,
    justifyContent: 'center',
  },
  timerWrap: { alignItems: 'center', marginTop: Spacing.md },
  questionWrap: { flex: 1, justifyContent: 'center', marginVertical: Spacing.md },
  dimmed: { opacity: 0.15 },
  pausedBanner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.amber,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  qCard: { padding: Spacing.xl },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  hintBadge: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.pill,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hintText: { flex: 1, lineHeight: 32 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 44,
  },
  answerRow: {
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  reversedWord: { letterSpacing: 2, lineHeight: 56 },
  controls: { gap: Spacing.sm },
  controlCol: { gap: Spacing.sm },
  controlRow: { flexDirection: 'row', gap: Spacing.sm },
  flex1: { flex: 1, minHeight: TOUCH_MIN },
  betweenWrap: { flex: 1, justifyContent: 'space-evenly' },
  betweenCard: { alignItems: 'center', gap: Spacing.md },
});
