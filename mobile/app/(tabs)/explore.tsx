// mobile/app/(tabs)/explore.tsx
// Explore screen — Interactive search, filter chips, and animated 2-column marketplace grid

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClayCard, ProductCard, ClayButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, clayElevation } from '@constants/theme';
import { fetchProducts } from '../../services/api';
import type { Product, ProductCategory } from '../../../shared/types';

const FILTER_TAGS = [
  { label: 'All Items', key: 'all' },
  { label: '📚 Textbooks', key: 'books' },
  { label: '📱 Electronics', key: 'electronics' },
  { label: '✏️ Stationery', key: 'stationery' },
  { label: '✨ Like New', key: 'like_new' },
  { label: '💰 Under ₹500', key: 'under_500' },
];

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(clearAnim, {
      toValue: search.length > 0 ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [search, clearAnim]);

  const performSearch = useCallback(async (query: string, filter: string) => {
    setError(null);
    try {
      let categoryParam: ProductCategory | undefined;
      if (filter === 'books' || filter === 'electronics' || filter === 'stationery') {
        categoryParam = filter as ProductCategory;
      }

      const data = await fetchProducts({
        search: query.trim() || undefined,
        category: categoryParam,
      });

      let filtered = data;
      if (filter === 'like_new') {
        filtered = data.filter((p) => p.condition === 'like_new' || p.condition === 'new');
      } else if (filter === 'under_500') {
        filtered = data.filter((p) => p.price <= 500);
      }

      setProducts(filtered);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to search products.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search, activeFilter);
    }, 280);
    return () => clearTimeout(timer);
  }, [search, activeFilter, performSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    performSearch(search, activeFilter);
  }, [search, activeFilter, performSearch]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Explore Campus</Text>
        <Text style={styles.pageSubtitle}>Search verified items across departments</Text>

        {/* Animated Search Input Container */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#8C7D9E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search titles, authors, modules..."
            placeholderTextColor="#8C7D9E"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Animated.View style={{ opacity: clearAnim, transform: [{ scale: clearAnim }] }}>
              <Pressable
                onPress={() => setSearch('')}
                style={styles.clearBtn}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color="#8C7D9E" />
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Quick Filter Tags Scroll */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TAGS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item.key;
            return (
              <Pressable
                onPress={() => setActiveFilter(item.key)}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipActive : styles.filterChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* 2-Column Product Grid */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#8B64DC" size="large" />
          <Text style={styles.loadingText}>Searching listings...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <ClayCard variant="peach" style={styles.statusCard}>
            <Ionicons name="alert-circle" size={36} color={Colors.error} />
            <Text style={Typography.bodyBold}>Search error</Text>
            <Text style={[Typography.caption, { color: Colors.error, textAlign: 'center' }]}>
              {error}
            </Text>
            <ClayButton
              label="Try Again"
              variant="secondary"
              onPress={() => performSearch(search, activeFilter)}
              style={{ marginTop: 8 }}
            />
          </ClayCard>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ClayCard style={styles.statusCard}>
            <Text style={{ fontSize: 40, marginBottom: 6 }}>🔍</Text>
            <Text style={Typography.bodyBold}>No results found</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              No items match &quot;{search || activeFilter}&quot;. Try broader terms or clear filters.
            </Text>
            <ClayButton
              label="Clear Search"
              variant="secondary"
              onPress={() => {
                setSearch('');
                setActiveFilter('all');
              }}
              style={{ marginTop: 12 }}
            />
          </ClayCard>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B64DC"
            />
          }
          renderItem={({ item }) => (
            <ProductCard product={item} style={styles.gridCard} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3FB',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ECE4F7',
    gap: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EEFA',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 2,
  },
  filterScroll: {
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  filterChipActive: {
    backgroundColor: '#8B64DC',
    borderColor: '#7A52CB',
  },
  filterChipInactive: {
    backgroundColor: Colors.white,
    borderColor: '#ECE4F7',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: Colors.white,
  },
  filterTextInactive: {
    color: '#6C47B2',
  },
  gridContent: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
    gap: 10,
  },
  gridCard: {
    flex: 1,
    maxWidth: '48.5%',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: '#8C7D9E',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Spacing.xl,
  },
  statusCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginVertical: 4,
  },
});
