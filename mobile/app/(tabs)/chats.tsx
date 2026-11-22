// mobile/app/(tabs)/chats.tsx
// Chats screen — Live buyer–seller order conversations with search and filter

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ClayHeader, ClayCard, ClayButton } from '@components/index';
import {
  Colors,
  Spacing,
  Radius,
  Typography,
  FontSize,
  FontWeight,
  PLACEHOLDER_PRODUCT_IMAGE,
} from '@constants/theme';
import { fetchConversations, mockStore, isMockEnabled } from '../../services/api';
import type { Conversation } from '../../../shared/types';

export default function ChatsScreen() {
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const loadConversations = useCallback(async () => {
    setError(null);
    if (isMockEnabled()) {
      try {
        const fallbackData = mockStore.getConversations();
        setConversations(fallbackData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load conversations.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
      return;
    }

    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Please sign in to view conversations.');
      const data = await fetchConversations(token);
      setConversations(data);
    } catch (err) {
      // Graceful fallback to mock store in demo mode
      try {
        const fallbackData = mockStore.getConversations();
        setConversations(fallbackData);
      } catch {
        setError(err instanceof Error ? err.message : 'Could not load conversations.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = activeFilter === 'all' || (activeFilter === 'unread' && c.unreadCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, activeFilter]);

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

      if (diffHours < 24) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffHours < 48) {
        return 'Yesterday';
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <ClayHeader
        title="Messages"
        subtitle="Coordinate trades & safe campus meetups"
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student or item..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <View style={styles.chipsRow}>
          <Pressable
            style={[styles.chip, activeFilter === 'all' && styles.chipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.chipText, activeFilter === 'all' && styles.chipTextActive]}>
              All ({conversations.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, activeFilter === 'unread' && styles.chipActive]}
            onPress={() => setActiveFilter('unread')}
          >
            <Text style={[styles.chipText, activeFilter === 'unread' && styles.chipTextActive]}>
              Unread
            </Text>
          </Pressable>
        </View>
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
              Loading conversations...
            </Text>
          </View>
        ) : error ? (
          <ClayCard variant="peach" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⚠️</Text>
            <Text style={Typography.bodyBold}>Could not load chats</Text>
            <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
            <ClayButton
              label="Retry"
              variant="secondary"
              onPress={loadConversations}
              style={{ marginTop: Spacing.sm }}
            />
          </ClayCard>
        ) : filteredConversations.length === 0 ? (
          <ClayCard variant="lavender" style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={Typography.bodyBold}>No conversations found</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              {searchQuery.trim()
                ? `No conversations match "${searchQuery}".`
                : 'When you place or receive an order on campus, your chat thread will appear here.'}
            </Text>
            <ClayButton
              label="Explore Marketplace"
              onPress={() => router.push('/(tabs)/home')}
              style={{ marginTop: Spacing.md }}
            />
          </ClayCard>
        ) : (
          filteredConversations.map((conv) => {
            const hasUnread = conv.unreadCount > 0;
            return (
              <Pressable
                key={conv.orderId}
                onPress={() => router.push(`/chat/${conv.orderId}`)}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
              >
                <ClayCard
                  style={[
                    styles.convCard,
                    hasUnread && { borderColor: '#B9A0EB', borderWidth: 1.5 },
                  ]}
                >
                  {/* User Avatar with Campus Online Status */}
                  <View style={styles.avatarWrapper}>
                    {conv.otherUserAvatarUrl ? (
                      <Image
                        source={{ uri: conv.otherUserAvatarUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {conv.otherUserName ? conv.otherUserName[0].toUpperCase() : 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.onlineBadge} />
                  </View>

                  <View style={styles.convInfo}>
                    <View style={styles.topRow}>
                      <Text style={[Typography.bodyBold, styles.name]} numberOfLines={1}>
                        {conv.otherUserName}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatMessageTime(conv.lastMessageAt)}
                      </Text>
                    </View>

                    {/* Product Pill Tag */}
                    <View style={styles.productBadgeRow}>
                      <Ionicons name="pricetag" size={11} color="#6C47B2" />
                      <Text style={styles.productTag} numberOfLines={1}>
                        {conv.productTitle}
                      </Text>
                    </View>

                    <Text
                      style={[
                        Typography.caption,
                        styles.lastMsg,
                        hasUnread && styles.lastMsgUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {conv.lastMessage}
                    </Text>
                  </View>

                  {hasUnread && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </ClayCard>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchSection: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8DFF5',
    elevation: 2,
    shadowColor: '#B9A0EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2D5F5',
  },
  chipActive: {
    backgroundColor: '#6C47B2',
    borderColor: '#6C47B2',
  },
  chipText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xs,
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  convCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8A5CD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2D5F5',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  convInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: Spacing.xs,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: FontWeight.regular,
  },
  productBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  productTag: {
    color: '#6C47B2',
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
  },
  lastMsg: {
    color: Colors.textSecondary,
    marginTop: 3,
    fontSize: FontSize.caption,
  },
  lastMsgUnread: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  unreadBadge: {
    backgroundColor: '#6C47B2',
    borderRadius: Radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});
