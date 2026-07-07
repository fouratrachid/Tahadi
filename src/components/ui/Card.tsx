import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  accent?: string;
}

/** Elevated surface card. An optional accent tints the start-edge border. */
export function Card({ children, style, accent }: Props) {
  return (
    <View
      style={[
        styles.card,
        accent ? { borderStartColor: accent, borderStartWidth: 4 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
});
