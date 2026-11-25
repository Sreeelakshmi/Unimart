// mobile/components/clay/ClayButton.tsx
// Claymorphism pill button with high-performance spring press animation and icon support

import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing, FontSize, FontWeight, clayElevation } from '@constants/theme';

export type ClayButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';

interface ClayButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ClayButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<
  ClayButtonVariant,
  { container: ViewStyle; text: TextStyle; border: string }
> = {
  primary: {
    container: { backgroundColor: '#8B64DC' },
    text: { color: Colors.white },
    border: '#7A52CB',
  },
  secondary: {
    container: {
      backgroundColor: Colors.white,
    },
    text: { color: '#6C47B2' },
    border: '#D8C9FA',
  },
  mint: {
    container: { backgroundColor: Colors.mint },
    text: { color: '#166542' },
    border: '#A9E3C8',
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: '#6C47B2' },
    border: 'transparent',
  },
  danger: {
    container: { backgroundColor: Colors.error },
    text: { color: Colors.white },
    border: '#E85555',
  },
};

export function ClayButton({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  onPress,
  ...rest
}: ClayButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 160,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  const isDisabled = disabled ?? loading;
  const vs = variantStyles[variant];

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={[
          styles.base,
          variant !== 'ghost' && clayElevation,
          vs.container,
          { borderColor: vs.border },
          isDisabled && styles.disabled,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={vs.text.color as string} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' ? (
              <View style={styles.leftIcon}>{icon}</View>
            ) : null}
            <Text style={[styles.text, vs.text, textStyle]}>{label}</Text>
            {icon && iconPosition === 'right' ? (
              <View style={styles.rightIcon}>{icon}</View>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  leftIcon: {
    marginRight: 2,
  },
  rightIcon: {
    marginLeft: 2,
  },
  text: {
    fontSize: FontSize.button,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.55,
  },
});
