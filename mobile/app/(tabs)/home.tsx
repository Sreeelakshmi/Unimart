// mobile/app/(tabs)/home.tsx
// Home screen — Live marketplace feed with categories, pull-to-refresh, and error states

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { ClayHeader, ClayCard, ProductCard, ClayButton } from '@components/index';
import { Colors, Spacing, Radius, Typography } from '@constants/theme';
import { fetchProducts } from '../../services/api';
import type { Product, ProductCategory } from '../../../shared/types';

const CATEGORIES: Array<{ label: string; key: ProductCategory | 'all' }> = [
  { label: '✨ All', key: 'all' },
  { label: '📚 Books', key: 'books' },
  { label: '📱 Electronics', key: 'electronics' },
  { label: '👕 Clothing', key: 'clothing' },
  { label: '✏️ Stationery', key: 'stationery' },
  { label: '⚽ Sports', key: 'sports' },
  { label: '🪑 Furniture', key: 'furniture' },
];

export default function HomeScreen() {
  const { user } = useUser();
  const firstName = user?.firstName ?? 'there';

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const params =
        selectedCategory === 'all'
          ? {}
          : { category: selectedCategory as ProductCategory };
      const data = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not load products.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    loadProducts();
  }, [loadProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProducts();
  }, [loadProducts]);

  return (
    <View style={styles.container}>
      <ClayHeader
        title={`Hey, ${firstName} 👋`}
        subtitle="What are you looking for today?"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Categories horizontal filter */}
        <View style={styles.section}>
          <Text style={[Typography.h3, styles.sectionTitle]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <ClayCard
                      variant={isSelected ? 'mint' : 'lavender'}
                      style={[
                        styles.chip,
                        isSelected && {
                          borderColor: Colors.primary,
                          borderWidth: 1.5,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.captionBold,
                          isSelected && { color: Colors.text },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </ClayCard>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Live Marketplace Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[Typography.h3, styles.sectionTitle]}>
              Available on Campus
            </Text>
            {products.length > 0 && (
              <Text style={Typography.caption}>
                {products.length} item{products.length === 1 ? '' : 's'}
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>
                Loading live listings...
              </Text>
            </View>
          ) : error ? (
            <ClayCard variant="peach" style={styles.statusCard}>
              <Text style={styles.statusEmoji}>⚠️</Text>
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
          )}
        </View>

        {/* Safety & Meetup Guide Banner */}
        <View style={styles.section}>
          <ClayCard variant="mint" style={styles.guideCard}>
            <Text style={Typography.bodyBold}>🤝 Safe Campus Meetups</Text>
            <Text style={[Typography.caption, { marginTop: 4 }]}>
              Meet in well-lit public campus spots like the Student Union,
              Library foyer, or University Cafe. Inspect items before completing
              trades.
            </Text>
          </ClayCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.xl },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { marginBottom: 0 },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  productList: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  productCard: { width: 180 },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  statusCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  statusEmoji: { fontSize: 36, marginBottom: 4 },
  errorText: { color: Colors.error, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary },
  retryBtn: { marginTop: Spacing.sm, minHeight: 38 },
  guideCard: { padding: Spacing.base },
});
