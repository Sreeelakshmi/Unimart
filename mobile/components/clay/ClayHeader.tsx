// mobile/components/clay/ClayHeader.tsx
// Screen header with large title, optional subtitle, back button, and right-slot icon

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '@constants/theme';
import { ClayBackButton } from './ClayBackButton';

interface ClayHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  style?: ViewStyle;
}

export function ClayHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  style,
}: ClayHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }, style]}>
      {showBack && (
        <View style={styles.backWrapper}>
          <ClayBackButton onPress={onBackPress} size={38} />
        </View>
      )}

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightIcon ? (
        <Pressable
          onPress={onRightPress}
          style={styles.iconButton}
          accessibilityRole="button"
          hitSlop={12}
        >
          {rightIcon}
        </Pressable>
      ) : showBack ? (
        <View style={styles.rightSpacer} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backWrapper: {
    marginRight: Spacing.xs,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  iconButton: {
    minWidth: 42,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 38,
  },
});
