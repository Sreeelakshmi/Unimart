// mobile/app/(tabs)/explore.tsx
// Explore screen — Live search and 2-column marketplace grid

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { ClayHeader, ClayInput, ClayCard, ProductCard, ClayButton } from '@components/index';
import { Colors, Spacing, Typography } from '@constants/theme';
import { fetchProducts } from '../../services/api';
import type { Product } from '../../../shared/types';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    setError(null);
    try {
      const data = await fetchProducts({
        search: query.trim() || undefined,
      });
      setProducts(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to search products.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search);
    }, 350); // Debounce search
    return () => clearTimeout(timer);
  }, [search, performSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    performSearch(search);
  }, [search, performSearch]);

  return (
    <View style={styles.container}>
      <ClayHeader title="Explore" subtitle="Find second-hand gems on campus" />

      <View style={styles.searchBar}>
        <ClayInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title, brand, or course..."
          returnKeyType="search"
          accessibilityLabel="Search products"
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>
            Searching campus items...
          </Text>
        </View>
      ) : error ? (
        <ClayCard variant="peach" style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={Typography.bodyBold}>Error Searching Listings</Text>
          <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
          <ClayButton
            label="Retry"
            variant="secondary"
            onPress={() => performSearch(search)}
            style={{ marginTop: Spacing.sm }}
          />
        </ClayCard>
      ) : products.length === 0 ? (
        <ClayCard style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={Typography.bodyBold}>No listings found</Text>
          <Text style={[Typography.caption, styles.emptyText]}>
            {search.trim()
              ? `No approved products found matching "${search}".`
              : 'There are currently no approved products listed on campus.'}
          </Text>
        </ClayCard>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item }) => (
            <ProductCard product={item} style={styles.card} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: { paddingHorizontal: Spacing.base, marginTop: Spacing.xs },
  list: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.xxxl },
  row: { gap: Spacing.sm },
  card: { flex: 1 },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    margin: Spacing.base,
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  errorText: { color: Colors.error, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary },
});
