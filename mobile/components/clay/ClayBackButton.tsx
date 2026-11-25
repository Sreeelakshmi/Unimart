// mobile/components/clay/ClayBackButton.tsx
// Modern circular claymorphism back button with smooth spring animation and tactile depth

import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Animated,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
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

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
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
