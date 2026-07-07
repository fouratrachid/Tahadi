import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, FontSize, Radius, Spacing, playerColor } from '@/constants/theme';
import { toAr } from '@/i18n/ar';
import type { PlayerIndex } from '@/types';

interface Props {
  names: [string, string];
  scores: [number, number];
  activePlayer: PlayerIndex | null;
  centerTop: string;
  centerBottom: string;
}

function PlayerChip({
  index,
  name,
  score,
  active,
}: {
  index: PlayerIndex;
  name: string;
  score: number;
  active: boolean;
}) {
  const color = playerColor(index);
  return (
    <View
      style={[
        styles.chip,
        { borderColor: active ? color : Colors.border, backgroundColor: active ? `${color}22` : Colors.surface },
      ]}
    >
      <AppText weight="bold" size={FontSize.sm} color={active ? color : Colors.textSecondary} center numberOfLines={1}>
        {name}
      </AppText>
      <AppText weight="black" size={FontSize.xl} color={active ? color : Colors.text} center>
        {toAr(score)}
      </AppText>
    </View>
  );
}

export function ScoreHeader({ names, scores, activePlayer, centerTop, centerBottom }: Props) {
  return (
    <View style={styles.row}>
      <PlayerChip index={0} name={names[0]} score={scores[0]} active={activePlayer === 0} />
      <View style={styles.center}>
        <AppText weight="medium" size={FontSize.xs} color={Colors.accent} center>
          {centerTop}
        </AppText>
        <AppText weight="bold" size={FontSize.sm} color={Colors.textSecondary} center>
          {centerBottom}
        </AppText>
      </View>
      <PlayerChip index={1} name={names[1]} score={scores[1]} active={activePlayer === 1} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  center: { flex: 1, alignItems: 'center', gap: 2 },
});
