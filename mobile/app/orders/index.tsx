// mobile/app/orders/index.tsx
// My Orders screen — Tabbed view of purchases and sales

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ClayHeader, ClayCard, ClayButton, StatusBadge } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight, PLACEHOLDER_PRODUCT_IMAGE } from '@constants/theme';
import { fetchMyBuyerOrders, fetchMySellerOrders } from '../../services/api';
import type { Order } from '../../../shared/types';

const PLACEHOLDER_IMAGE = PLACEHOLDER_PRODUCT_IMAGE;

type OrdersTab = 'purchases' | 'sales';

export default function MyOrdersScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [activeTab, setActiveTab] = useState<OrdersTab>('purchases');
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Authentication required.');

      const [buyerData, sellerData] = await Promise.all([
        fetchMyBuyerOrders(token),
        fetchMySellerOrders(token),
      ]);
      setPurchases(buyerData);
      setSales(sellerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  const currentList = activeTab === 'purchases' ? purchases : sales;

  return (
    <View style={styles.container}>
      <ClayHeader title="My Orders" subtitle="Track your campus purchases & sales" showBack={true} />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'purchases' && styles.tabActive]}
          onPress={() => setActiveTab('purchases')}
        >
          <Text style={[styles.tabText, activeTab === 'purchases' && styles.tabTextActive]}>
            🛍️ Purchases ({purchases.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
            🏪 Sales ({sales.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading orders...</Text>
          </View>
        ) : error ? (
          <ClayCard variant="peach" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={Typography.bodyBold}>Could not load orders</Text>
            <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
            <ClayButton label="Retry" variant="secondary" onPress={loadOrders} style={{ marginTop: Spacing.sm }} />
          </ClayCard>
        ) : currentList.length === 0 ? (
          <ClayCard variant="lavender" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>{activeTab === 'purchases' ? '🛍️' : '🏪'}</Text>
            <Text style={Typography.bodyBold}>No {activeTab} yet</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              {activeTab === 'purchases'
                ? 'Browse the marketplace to find textbooks, electronics, and supplies!'
                : 'Orders for your listings will appear here when students buy from you.'}
            </Text>
            {activeTab === 'purchases' && (
              <ClayButton
                label="Browse Marketplace"
                onPress={() => router.push('/(tabs)/home')}
                style={{ marginTop: Spacing.md }}
              />
            )}
          </ClayCard>
        ) : (
          currentList.map((order) => (
            <Pressable key={order.id} onPress={() => router.push(`/order/${order.id}`)}>
              <ClayCard style={styles.orderCard}>
                <Image
                  source={{ uri: order.productImage || PLACEHOLDER_IMAGE }}
                  style={styles.thumbnail}
                />
                <View style={styles.orderInfo}>
                  <View style={styles.orderHeader}>
                    <Text style={[Typography.bodyBold, styles.orderTitle]} numberOfLines={1}>
                      {order.productTitle}
                    </Text>
                    <StatusBadge status={order.status} />
                  </View>
                  <Text style={styles.price}>₹{order.amount.toLocaleString('en-IN')}</Text>
                  <Text style={Typography.caption} numberOfLines={1}>
                    {activeTab === 'purchases' ? `Seller: ${order.sellerName}` : `Buyer: ${order.buyerName}`}
                  </Text>
                  <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>
                    📍 {order.meetupLocation || 'Campus Center'} · {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </ClayCard>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: { fontSize: FontSize.caption, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  tabTextActive: { color: Colors.white },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 44, marginBottom: Spacing.sm },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xs },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
  orderCard: { flexDirection: 'row', padding: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'center' },
  thumbnail: { width: 70, height: 70, borderRadius: Radius.md, marginRight: Spacing.sm },
  orderInfo: { flex: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { flex: 1, marginRight: Spacing.xs },
  price: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.text, marginVertical: 2 },
});

