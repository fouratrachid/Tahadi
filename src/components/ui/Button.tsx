import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, FontSize, Radius, Spacing, TOUCH_MIN } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'amber' | 'ghost';

interface Props {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  big?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}

const BG: Record<ButtonVariant, string> = {
  primary: Colors.accent,
  secondary: Colors.surfaceAlt,
  danger: Colors.danger,
  amber: Colors.amber,
  ghost: Colors.transparent,
};

const FG: Record<ButtonVariant, string> = {
  primary: Colors.bg,
  secondary: Colors.text,
  danger: Colors.text,
  amber: Colors.bg,
  ghost: Colors.text,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  big = false,
  fullWidth = true,
  style,
  children,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: BG[variant],
          minHeight: big ? 64 : TOUCH_MIN,
          borderWidth: variant === 'secondary' || variant === 'ghost' ? 1.5 : 0,
          borderColor: Colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'center',
        },
        style,
      ]}
    >
      {children ?? (
        <View style={styles.inner}>
          <AppText weight="bold" size={big ? FontSize.lg : FontSize.md} color={FG[variant]} center>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
