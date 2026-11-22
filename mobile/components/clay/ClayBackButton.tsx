// mobile/components/clay/ClayBackButton.tsx
// Modern circular claymorphism back button with chevron icon and soft depth

import React from 'react';
import {
  Pressable,
  StyleSheet,
  type ViewStyle,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, clayElevation } from '@constants/theme';

interface ClayBackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  iconColor?: string;
  size?: number;
}

export function ClayBackButton({
  onPress,
  style,
  iconColor = Colors.text,
  size = 40,
}: ClayBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pressed ? 0.75 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        clayElevation,
        style,
      ]}
    >
      <Ionicons
        name="chevron-back"
        size={Math.round(size * 0.55)}
        color={iconColor}
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DFF5',
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  icon: {
    marginLeft: -1, // optical center for chevron-back
  },
});

