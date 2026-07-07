import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { AR, toAr } from '@/i18n/ar';
import { CATEGORIES, CHALLENGE_TYPES, categoryTotal, getPack, grandTotal } from '@/lib/packs';

export default function PacksScreen() {
  return (
    <Screen scroll>
      <ScreenHeader title={AR.packs.title} />
      <AppText
        weight="bold"
        size={FontSize.sm}
        color={Colors.accent}
        style={{ marginBottom: Spacing.lg }}
      >
        {AR.packs.total(grandTotal())}
      </AppText>

      {CATEGORIES.map((cat) => (
        <Card key={cat} style={styles.card} accent={Colors.accent}>
          <View style={styles.headRow}>
            <AppText weight="black" size={FontSize.lg}>
              {AR.categories[cat]}
            </AppText>
            <AppText weight="bold" size={FontSize.sm} color={Colors.amber}>
              {`${toAr(categoryTotal(cat))} ${AR.packs.questions}`}
            </AppText>
          </View>
          <View style={styles.countsWrap}>
            {CHALLENGE_TYPES.map((ch) => (
              <View key={ch} style={styles.countChip}>
                <AppText size={FontSize.xs} color={Colors.textSecondary}>
                  {AR.challenges[ch].name}
                </AppText>
                <AppText weight="bold" size={FontSize.sm}>
                  {toAr(getPack(cat, ch).length)}
                </AppText>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  countsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  countChip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
});
