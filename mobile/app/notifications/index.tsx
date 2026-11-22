// mobile/app/notifications/index.tsx
// In-App Notifications Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ClayHeader, ClayCard, ClayButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight } from '@constants/theme';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/api';
import type { AppNotification } from '../../../shared/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Authentication required.');
      const data = await fetchNotifications(token);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (item: AppNotification) => {
    try {
      const token = await getToken();
      if (token && !item.read) {
        await markNotificationAsRead(token, item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
        );
      }
    } catch (err) {
      console.warn('[Mark read error]', err);
    }

    // Deep link based on notification data
    if (item.data?.orderId) {
      router.push(`/order/${item.data.orderId}`);
    } else if (item.data?.productId) {
      router.push(`/product/${item.data.productId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('[Mark all read error]', err);
    }
  };

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'new_order':
        return '🛍️';
      case 'order_status':
        return '📦';
      case 'product_approved':
        return '🚀';
      case 'product_rejected':
        return '⚠️';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <View style={styles.container}>
      <ClayHeader title="Notifications" subtitle="Campus updates & activity" />

      {notifications.some((n) => !n.read) && (
        <View style={styles.topActions}>
          <Pressable onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>✓ Mark all as read</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <ClayCard variant="peach" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={Typography.bodyBold}>Could not load notifications</Text>
            <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
            <ClayButton label="Retry" variant="secondary" onPress={loadNotifications} style={{ marginTop: Spacing.sm }} />
          </ClayCard>
        ) : notifications.length === 0 ? (
          <ClayCard variant="lavender" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={Typography.bodyBold}>No notifications yet</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              Updates about your orders, product reviews, and messages will show up here.
            </Text>
          </ClayCard>
        ) : (
          notifications.map((item) => (
            <Pressable key={item.id} onPress={() => handleNotificationPress(item)}>
              <ClayCard
                variant={!item.read ? 'lavender' : undefined}
                style={[styles.notifCard, !item.read && styles.unreadCard]}
              >
                <Text style={styles.notifEmoji}>{getEmojiForType(item.type)}</Text>
                <View style={styles.notifInfo}>
                  <View style={styles.notifHeader}>
                    <Text style={[Typography.bodyBold, styles.notifTitle]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.timeText}>
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={[Typography.caption, styles.notifMsg]}>
                    {item.message}
                  </Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
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
  topActions: { alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  markAllText: { color: Colors.primary, fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
  emptyEmoji: { fontSize: 44, marginBottom: Spacing.sm },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xs },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
  notifCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notifEmoji: { fontSize: 26, marginRight: Spacing.md },
  notifInfo: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { flex: 1, marginRight: Spacing.xs },
  timeText: { fontSize: 10, color: Colors.textSecondary },
  notifMsg: { color: Colors.text, marginTop: 2 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
  },
});

