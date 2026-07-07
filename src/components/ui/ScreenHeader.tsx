import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { AR } from '@/i18n/ar';

interface Props {
  title: string;
}

export function ScreenHeader({ title }: Props) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => [styles.back, { opacity: pressed ? 0.7 : 1 }]}
      >
        <AppText weight="bold" size={FontSize.sm} color={Colors.accent}>
          {`‹ ${AR.common.back}`}
        </AppText>
      </Pressable>
      <AppText weight="black" size={FontSize.xl}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  back: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
