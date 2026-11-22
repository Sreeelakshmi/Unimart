// mobile/app/seller/dashboard.tsx
// Seller Dashboard — Manage personal listings with live status updates, sold toggle, and deletion

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ClayButton, ClayCard, StatusBadge, ClayBackButton } from '@components/index';
import { Colors, Spacing, Typography } from '@constants/theme';
import {
  fetchMyListings,
  updateProduct,
  deleteProduct,
} from '../../services/api';
import type { Product } from '../../../shared/types';

type Tab = 'active' | 'pending' | 'sold' | 'rejected';

const statusForTab: Record<Tab, Product['status'][]> = {
  active: ['available', 'verified'],
  pending: ['pending', 'pending_review', 'under_review'],
  sold: ['sold'],
  rejected: ['rejected'],
};

export default function SellerDashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) {
        throw new Error('Please sign in to view your seller dashboard.');
      }
      const data = await fetchMyListings(token);
      setListings(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not load your listings.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, [loadListings]);

  // Mark product as sold or available
  const handleToggleSold = async (product: Product) => {
    const newStatus = product.status === 'sold' ? 'available' : 'sold';
    const actionLabel = newStatus === 'sold' ? 'Mark as Sold' : 'Reactivate';

    Alert.alert(
      actionLabel,
      `Are you sure you want to change this listing status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionInProgress(product.id);
            try {
              const token = await getToken();
              if (!token) throw new Error('Not authenticated.');
              await updateProduct(token, product.id, { status: newStatus });
              await loadListings();
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : 'Failed to update status.';
              Alert.alert('Error', msg);
            } finally {
              setActionInProgress(null);
            }
          },
        },
      ],
    );
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to permanently delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionInProgress(productId);
            try {
              const token = await getToken();
              if (!token) throw new Error('Not authenticated.');
              await deleteProduct(token, productId);
              await loadListings();
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : 'Failed to delete listing.';
              Alert.alert('Error', msg);
            } finally {
              setActionInProgress(null);
            }
          },
        },
      ],
    );
  };

  const currentTabListings = listings.filter((p) =>
    statusForTab[activeTab].includes(p.status),
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ClayBackButton size={38} />
        <Text style={[Typography.h2, styles.title]}>Seller Dashboard</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['active', 'pending', 'sold', 'rejected'] as Tab[]).map((tab) => {
          const count = listings.filter((p) =>
            statusForTab[tab].includes(p.status),
          ).length;
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text
                style={[
                  Typography.captionBold,
                  isActive ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>
              Loading your listings...
            </Text>
          </View>
        ) : error ? (
          <ClayCard variant="peach" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={Typography.bodyBold}>Could not load listings</Text>
            <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
            <ClayButton
              label="Retry"
              variant="secondary"
              onPress={loadListings}
              style={{ marginTop: Spacing.sm }}
            />
          </ClayCard>
        ) : currentTabListings.length === 0 ? (
          <ClayCard variant="lavender" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>
              {activeTab === 'active'
                ? '🏪'
                : activeTab === 'pending'
                ? '⏳'
                : activeTab === 'sold'
                ? '🎉'
                : '📋'}
            </Text>
            <Text style={Typography.bodyBold}>No {activeTab} listings</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              {activeTab === 'pending'
                ? 'Items waiting for review will appear here.'
                : activeTab === 'rejected'
                ? 'No rejected items.'
                : `You currently have no ${activeTab} items listed.`}
            </Text>
          </ClayCard>
        ) : (
          currentTabListings.map((listing) => (
            <ClayCard key={listing.id} style={styles.listingCard}>
              <View style={styles.listingHeader}>
                <View style={styles.listingInfo}>
                  <Text style={Typography.bodyBold} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={styles.price}>
                    ₹{listing.price.toLocaleString('en-IN')}
                  </Text>
                  <Text style={Typography.caption}>
                    Category: {listing.category} · Condition: {listing.condition}
                  </Text>
                </View>
                <StatusBadge status={listing.status} />
              </View>

              {/* If rejected, show the reviewer's reason */}
              {listing.status === 'rejected' && listing.rejectionReason ? (
                <ClayCard variant="peach" style={styles.rejectionNotice}>
                  <Text style={Typography.captionBold}>Rejection Reason:</Text>
                  <Text style={Typography.caption}>{listing.rejectionReason}</Text>
                </ClayCard>
              ) : null}

              <View style={styles.listingActions}>
                {/* Sold Toggle */}
                {['available', 'verified', 'sold'].includes(listing.status) && (
                  <ClayButton
                    label={
                      listing.status === 'sold'
                        ? 'Reactivate'
                        : 'Mark Sold'
                    }
                    variant={listing.status === 'sold' ? 'primary' : 'secondary'}
                    onPress={() => handleToggleSold(listing)}
                    loading={actionInProgress === listing.id}
                    style={styles.smallButton}
                  />
                )}

                {/* View Details */}
                <ClayButton
                  label="View"
                  variant="ghost"
                  onPress={() => router.push(`/product/${listing.id}`)}
                  style={styles.smallButton}
                />

                {/* Edit */}
                <ClayButton
                  label="Edit"
                  variant="secondary"
                  onPress={() => router.push(`/seller/edit/${listing.id}`)}
                  style={styles.smallButton}
                />

                {/* Delete */}
                <ClayButton
                  label="Delete"
                  variant="danger"
                  onPress={() => handleDelete(listing.id)}
                  loading={actionInProgress === listing.id}
                  style={styles.smallButton}
                />
              </View>
            </ClayCard>
          ))
        )}

        <ClayButton
          label="+ Create New Listing"
          onPress={() => router.push('/(tabs)/sell')}
          style={styles.newButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xxxl,
  },
  title: { flex: 1, textAlign: 'center', marginRight: 60 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 4,
    marginTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: Colors.white,
  },
  activeTab: { backgroundColor: Colors.primary },
  activeTabText: { color: Colors.white },
  inactiveTabText: { color: Colors.textSecondary, fontSize: 11 },
  scroll: {
    padding: Spacing.base,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, gap: 4 },
  emptyEmoji: { fontSize: 36, marginBottom: 4 },
  emptyText: { textAlign: 'center', color: Colors.textSecondary },
  errorText: { color: Colors.error, textAlign: 'center' },
  listingCard: { gap: Spacing.sm },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listingInfo: { flex: 1, marginRight: Spacing.sm, gap: 2 },
  price: { color: Colors.primary, fontWeight: '700', fontSize: 16 },
  rejectionNotice: { padding: Spacing.sm, gap: 2 },
  listingActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  smallButton: {
    flex: 1,
    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  newButton: { marginTop: Spacing.sm },
});
