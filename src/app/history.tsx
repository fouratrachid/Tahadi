import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, FontSize, Spacing, playerColor } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { loadHistory } from '@/lib/storage';
import type { GameRecord } from '@/types';

function formatDate(ms: number): string {
  const d = new Date(ms);
  return toAr(
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate(),
    ).padStart(2, '0')}`,
  );
}

export default function HistoryScreen() {
  const [records, setRecords] = useState<GameRecord[] | null>(null);

  useEffect(() => {
    void loadHistory().then(setRecords);
  }, []);

  return (
    <Screen scroll>
      <ScreenHeader title={AR.history.title} />

      {records != null && records.length === 0 ? (
        <View style={styles.empty}>
          <AppText size={40} center>
            🎲
          </AppText>
          <AppText weight="bold" size={FontSize.md} color={Colors.textSecondary} center>
            {AR.history.empty}
          </AppText>
        </View>
      ) : null}

      {(records ?? []).map((rec) => {
        const winnerColor =
          rec.winner === -1 ? Colors.amber : playerColor(rec.winner);
        return (
          <Card key={rec.id} style={styles.card} accent={winnerColor}>
            <View style={styles.topRow}>
              <AppText weight="bold" size={FontSize.md}>
                {`${rec.players[0]} ${AR.history.vs} ${rec.players[1]}`}
              </AppText>
              <AppText size={FontSize.xs} color={Colors.textMuted}>
                {formatDate(rec.date)}
              </AppText>
            </View>
            <View style={styles.scoreRow}>
              <AppText weight="black" size={FontSize.xl} color={playerColor(0)}>
                {toAr(rec.scores[0])}
              </AppText>
              <AppText weight="bold" size={FontSize.sm} color={winnerColor}>
                {rec.winner === -1
                  ? AR.history.tie
                  : AR.final.winner(rec.players[rec.winner])}
              </AppText>
              <AppText weight="black" size={FontSize.xl} color={playerColor(1)}>
                {toAr(rec.scores[1])}
              </AppText>
            </View>
            <AppText size={FontSize.xs} color={Colors.textSecondary}>
              {rec.categories.map((c) => AR.categories[c]).join(' · ')}
            </AppText>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xxxl },
  card: { marginBottom: Spacing.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});
