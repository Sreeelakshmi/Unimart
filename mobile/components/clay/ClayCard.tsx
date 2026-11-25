// mobile/components/clay/ClayCard.tsx
// Claymorphism card surface with soft depth, border highlight, and optional press animation

import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
  Platform,
} from 'react-native';
import { Colors, Radius, Spacing, clayElevation } from '@constants/theme';

export type ClayCardVariant = 'default' | 'mint' | 'peach' | 'lavender';

const variantBackground: Record<ClayCardVariant, string> = {
  default: Colors.white,
  mint: Colors.mint,
  peach: Colors.peach,
  lavender: Colors.lavender,
};

const variantBorder: Record<ClayCardVariant, string> = {
  default: '#ECE4F7',
  mint: '#B2EAD2',
  peach: '#FFB2A1',
  lavender: '#D8C9FA',
};

interface ClayCardProps extends ViewProps {
  variant?: ClayCardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  interactive?: boolean;
  children: React.ReactNode;
}

export function ClayCard({
  variant = 'default',
  style,
  onPress,
  interactive = false,
  children,
  ...rest
}: ClayCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  if (onPress || interactive) {
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        friction: 8,
        tension: 140,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
    };

    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={[
            styles.card,
            {
              backgroundColor: variantBackground[variant],
              borderColor: variantBorder[variant],
            },
            style,
          ]}
          {...rest}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variantBackground[variant],
          borderColor: variantBorder[variant],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1.5,
    ...clayElevation,
  },
});
