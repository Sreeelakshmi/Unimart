// mobile/app/(tabs)/_layout.tsx
// Bottom tab navigator with high-visibility vector icons and clay styling

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '@constants/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IoniconName;
  focusedName: IoniconName;
  focused: boolean;
  color: string;
  badgeCount?: number;
}

function TabIcon({ name, focusedName, focused, color, badgeCount }: TabIconProps) {
  return (
    <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
      <Ionicons
        name={focused ? focusedName : name}
        size={22}
        color={focused ? '#6C47B2' : '#8C7D9E'}
      />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
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
    borderTopWidth: 1,
    borderTopColor: '#ECE4F7',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrapper: {
    width: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    position: 'relative',
  },
  activeIconWrapper: {
    backgroundColor: '#EFE7FC',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: '#FF5252',
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
