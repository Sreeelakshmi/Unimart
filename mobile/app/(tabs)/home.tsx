// mobile/app/(tabs)/home.tsx
// Home screen — Premium campus marketplace experience with animated categories, quick actions, search bar, and live feed

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ClayCard, ProductCard, ClayButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, clayElevation } from '@constants/theme';
import { fetchProducts } from '../../services/api';
import type { Product, ProductCategory } from '../../../shared/types';

const CATEGORIES: Array<{ label: string; key: ProductCategory | 'all'; icon: string }> = [
  { label: 'All', key: 'all', icon: 'sparkles' },
  { label: 'Books', key: 'books', icon: 'book' },
  { label: 'Electronics', key: 'electronics', icon: 'laptop' },
  { label: 'Clothing', key: 'clothing', icon: 'shirt' },
  { label: 'Stationery', key: 'stationery', icon: 'pencil' },
  { label: 'Sports', key: 'sports', icon: 'football' },
  { label: 'Furniture', key: 'furniture', icon: 'cube' },
];

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
}

function QuickActionTile({ icon, label, color, bgColor, borderColor, onPress }: QuickActionProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.quickActionWrapper]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.quickActionTile, { backgroundColor: bgColor, borderColor }]}
      >
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName ?? 'Student';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entrance animation for content
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const params =
        selectedCategory === 'all'
          ? {}
          : { category: selectedCategory as ProductCategory };
      const data = await fetchProducts(params);
      setProducts(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load products.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, fadeAnim]);

  useEffect(() => {
    setLoading(true);
    fadeAnim.setValue(0);
    loadProducts();
  }, [loadProducts, fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  return (
    <View style={styles.container}>
      {/* Top App Header with Greeting and Notification Bell */}
      <View style={styles.topHeader}>
        <View style={styles.userGreetingRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.greetingTextContainer}>
            <View style={styles.verifiedRow}>
              <Text style={styles.greetingSubtitle}>RAMAIAH CAMPUS</Text>
              <Ionicons name="checkmark-circle" size={13} color="#166542" />
            </View>
            <Text style={styles.greetingTitle}>Hey, {firstName} 👋</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/notifications')}
          style={styles.notificationBell}
          hitSlop={10}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B64DC"
          />
        }
      >
        {/* Interactive Search Bar Trigger */}
        <View style={styles.searchBarWrapper}>
          <Pressable
            onPress={() => router.push('/explore')}
            style={styles.searchBar}
          >
            <Ionicons name="search" size={20} color="#8C7D9E" />
            <Text style={styles.searchPlaceholder}>
              Search textbooks, calculators, dorm gear...
            </Text>
            <View style={styles.searchBadge}>
              <Ionicons name="options-outline" size={16} color="#6C47B2" />
            </View>
          </Pressable>
        </View>

        {/* Quick Action Tiles */}
        <View style={styles.quickActionsContainer}>
          <QuickActionTile
            icon="add-circle"
            label="Sell Item"
            color="#6C47B2"
            bgColor="#F0E8FD"
            borderColor="#DECFFC"
            onPress={() => router.push('/sell')}
          />
          <QuickActionTile
            icon="heart"
            label="Wishlist"
            color="#D83260"
            bgColor="#FFEBF1"
            borderColor="#FFD4E2"
            onPress={() => router.push('/wishlist')}
          />
          <QuickActionTile
            icon="receipt"
            label="Orders"
            color="#0F766E"
            bgColor="#E6FFFA"
            borderColor="#B2F5EA"
            onPress={() => router.push('/orders')}
          />
          <QuickActionTile
            icon="shield-checkmark"
            label="Admin"
            color="#B45309"
            bgColor="#FEF3C7"
            borderColor="#FDE68A"
            onPress={() => router.push('/admin/dashboard')}
          />
        </View>

        {/* Categories Horizontal Filter Chips */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionSubtitle}>Select category to filter</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={isSelected ? Colors.white : '#6C47B2'}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Featured Campus Marketplace Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.sectionTitle}>Campus Deals</Text>
              <View style={styles.liveCountBadge}>
                <Text style={styles.liveCountText}>{products.length} live</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/explore')}>
              <Text style={styles.seeAllText}>See all &gt;</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color="#8B64DC" size="large" />
              <Text style={styles.loadingText}>Fetching verified campus listings...</Text>
            </View>
          ) : error ? (
            <ClayCard variant="peach" style={styles.statusCard}>
              <Ionicons name="alert-circle" size={40} color={Colors.error} />
              <Text style={Typography.bodyBold}>Failed to load listings</Text>
              <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
              <ClayButton
                label="Retry"
                variant="secondary"
                onPress={loadProducts}
                style={styles.retryBtn}
              />
            </ClayCard>
          ) : products.length === 0 ? (
            <ClayCard style={styles.statusCard}>
              <Text style={styles.statusEmoji}>📦</Text>
              <Text style={Typography.bodyBold}>No products found</Text>
              <Text style={[Typography.caption, styles.emptyText]}>
                {selectedCategory === 'all'
                  ? 'No approved items are currently available in the marketplace.'
                  : `No approved items found in '${selectedCategory}'.`}
              </Text>
            </ClayCard>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={3}
                removeClippedSubviews={Platform.OS === 'android'}
                renderItem={({ item }) => (
                  <ProductCard product={item} style={styles.productCard} />
                )}
                contentContainerStyle={styles.productList}
              />
            </Animated.View>
          )}
        </View>

        {/* Safety & Meetup Guide Banner */}
        <View style={styles.section}>
          <ClayCard variant="mint" style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#166542" />
              <Text style={styles.guideTitle}>Safe Campus Meetups</Text>
            </View>
            <Text style={styles.guideBody}>
              Always exchange items at certified safe campus zones like the{' '}
              <Text style={{ fontWeight: '700' }}>Library Central Steps</Text> or{' '}
              <Text style={{ fontWeight: '700' }}>SAC Cafe</Text>. Inspect condition in
              person before releasing UPI escrow!
            </Text>
          </ClayCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3FB',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ECE4F7',
  },
  userGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B64DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D8C9FA',
  },
  avatarInitials: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  greetingTextContainer: {
    gap: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166542',
    letterSpacing: 0.6,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  notificationBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EEFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4B72',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  searchBarWrapper: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    gap: 10,
    ...clayElevation,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#8C7D9E',
    fontWeight: '500',
  },
  searchBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFE7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
    justifyContent: 'space-between',
  },
  quickActionWrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  quickActionTile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 4,
    ...clayElevation,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  liveCountBadge: {
    backgroundColor: '#CFF2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#B2EAD2',
  },
  liveCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166542',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B64DC',
  },
  chipsScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    gap: 6,
    ...clayElevation,
  },
  chipSelected: {
    backgroundColor: '#8B64DC',
    borderColor: '#7A52CB',
  },
  chipUnselected: {
    backgroundColor: Colors.white,
    borderColor: '#ECE4F7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: Colors.white,
  },
  chipTextUnselected: {
    color: '#6C47B2',
  },
  productList: {
    gap: 12,
    paddingVertical: Spacing.xs,
  },
  productCard: {
    width: 175,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 12,
    color: '#8C7D9E',
    fontWeight: '600',
  },
  statusCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  statusEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  retryBtn: {
    marginTop: Spacing.sm,
    minHeight: 38,
  },
  guideCard: {
    padding: Spacing.base,
    gap: 6,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166542',
  },
  guideBody: {
    fontSize: 12,
    color: '#166542',
    lineHeight: 18,
  },
});
