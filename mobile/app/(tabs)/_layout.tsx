// mobile/app/(tabs)/_layout.tsx
// Bottom tab navigator with animated spring icons, clay active pills, and smooth transitions

import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IoniconName;
  focusedName: IoniconName;
  focused: boolean;
  color: string;
  badgeCount?: number;
}

function TabIcon({ name, focusedName, focused, color, badgeCount }: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.08 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 180,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        focused && styles.activeIconWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Ionicons
        name={focused ? focusedName : name}
        size={21}
        color={focused ? '#6C47B2' : '#8C7D9E'}
      />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C47B2',
        tabBarInactiveTintColor: '#8C7D9E',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="home-outline"
              focusedName="home"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="search-outline"
              focusedName="search"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="add-circle-outline"
              focusedName="add-circle"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="chatbubbles-outline"
              focusedName="chatbubbles"
              focused={focused}
              color={color}
              badgeCount={1}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1.5,
    borderTopColor: '#ECE4F7',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  iconWrapper: {
    width: 46,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    position: 'relative',
  },
  activeIconWrapper: {
    backgroundColor: '#EFE7FC',
    borderWidth: 1,
    borderColor: '#D8C9FA',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: 2,
    backgroundColor: '#FF4B72',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
