import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { hapticSelect } from '@/lib/haptics';
import { CATEGORIES, CHALLENGE_TYPES } from '@/lib/packs';
import { useGameStore } from '@/store/gameStore';
import type { Category, ChallengeType, TimerSeconds } from '@/types';

const TIMERS: TimerSeconds[] = [15, 30, 45, 60];
const MAX_CATEGORIES = 3;
const REQUIRED_CHALLENGES = 4;

export default function SetupScreen() {
  const router = useRouter();
  const configureGame = useGameStore((s) => s.configureGame);

  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [categories, setCategories] = useState<Category[]>(['football']);
  const [challenges, setChallenges] = useState<ChallengeType[]>([
    'speed',
    'whoAmI',
    'reversed',
    'bell',
  ]);
  const [timerSec, setTimerSec] = useState<TimerSeconds>(30);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: Category) => {
    hapticSelect();
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, cat];
    });
  };

  const toggleChallenge = (ch: ChallengeType) => {
    hapticSelect();
    setChallenges((prev) => {
      if (prev.includes(ch)) return prev.filter((c) => c !== ch);
      if (prev.length >= REQUIRED_CHALLENGES) return prev;
      return [...prev, ch];
    });
  };

  const onStart = () => {
    if (!name1.trim() || !name2.trim()) return setError(AR.setup.errNames);
    if (categories.length < 1) return setError(AR.setup.errCategories);
    if (challenges.length !== REQUIRED_CHALLENGES) return setError(AR.setup.errChallenges);
    setError(null);
    const ok = configureGame({
      players: [name1.trim(), name2.trim()],
      categories,
      challenges,
      timerSec,
    });
    if (ok) router.replace('/game/round-intro');
  };

  return (
    <Screen scroll>
      <ScreenHeader title={AR.setup.title} />

      {/* Players */}
      <AppText weight="bold" size={FontSize.lg} style={styles.section}>
        {AR.setup.playersTitle}
      </AppText>
      <View style={styles.field}>
        <AppText size={FontSize.sm} color={Colors.textSecondary}>
          {AR.setup.player1}
        </AppText>
        <TextInput
          value={name1}
          onChangeText={setName1}
          placeholder={AR.setup.playerPlaceholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          maxLength={16}
        />
      </View>
      <View style={styles.field}>
        <AppText size={FontSize.sm} color={Colors.textSecondary}>
          {AR.setup.player2}
        </AppText>
        <TextInput
          value={name2}
          onChangeText={setName2}
          placeholder={AR.setup.playerPlaceholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          maxLength={16}
        />
      </View>

      {/* Categories */}
      <AppText weight="bold" size={FontSize.lg} style={styles.section}>
        {AR.setup.categoriesTitle}
      </AppText>
      <View style={styles.chipWrap}>
        {CATEGORIES.map((cat) => {
          const selected = categories.includes(cat);
          return (
            <Chip
              key={cat}
              label={AR.categories[cat]}
              selected={selected}
              onPress={() => toggleCategory(cat)}
            />
          );
        })}
      </View>

      {/* Challenges */}
      <AppText weight="bold" size={FontSize.lg} style={styles.section}>
        {AR.setup.challengesTitle}
      </AppText>
      <AppText size={FontSize.xs} color={Colors.textMuted} style={{ marginBottom: Spacing.sm }}>
        {AR.setup.orderHint}
      </AppText>
      <View style={styles.chipWrap}>
        {CHALLENGE_TYPES.map((ch) => {
          const order = challenges.indexOf(ch);
          return (
            <Chip
              key={ch}
              label={AR.challenges[ch].name}
              selected={order >= 0}
              badge={order >= 0 ? toAr(order + 1) : undefined}
              onPress={() => toggleChallenge(ch)}
            />
          );
        })}
      </View>

      {/* Timer */}
      <AppText weight="bold" size={FontSize.lg} style={styles.section}>
        {AR.setup.timerTitle}
      </AppText>
      <View style={styles.chipWrap}>
        {TIMERS.map((t) => (
          <Chip
            key={t}
            label={`${toAr(t)} ${AR.setup.seconds}`}
            selected={timerSec === t}
            onPress={() => {
              hapticSelect();
              setTimerSec(t);
            }}
          />
        ))}
      </View>

      {error ? (
        <AppText color={Colors.danger} center style={{ marginTop: Spacing.md }}>
          {error}
        </AppText>
      ) : null}

      <View style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxl }}>
        <Button label={AR.setup.start} big onPress={onStart} />
      </View>
    </Screen>
  );
}

function Chip({
  label,
  selected,
  badge,
  onPress,
}: {
  label: string;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? Colors.accent : Colors.surface,
          borderColor: selected ? Colors.accent : Colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {badge ? (
        <View style={styles.badge}>
          <AppText weight="black" size={FontSize.xs} color={Colors.accent}>
            {badge}
          </AppText>
        </View>
      ) : null}
      <AppText
        weight="bold"
        size={FontSize.sm}
        color={selected ? Colors.bg : Colors.text}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  field: { gap: Spacing.xs, marginBottom: Spacing.md },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: FontSize.lg,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  badge: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.pill,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
