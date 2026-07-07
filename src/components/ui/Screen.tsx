import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: ViewStyle;
  edges?: Edge[];
}

/** Gradient game-show background + safe area wrapper used by every screen. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  contentStyle,
  edges = ['top', 'bottom'],
}: Props) {
  const padStyle = padded ? styles.padded : undefined;
  return (
    <LinearGradient colors={[Colors.bg, Colors.bgGradientEnd]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={edges}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, padStyle, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, padStyle, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: Spacing.xl },
  scrollContent: { flexGrow: 1, paddingVertical: Spacing.lg },
});
