// mobile/app/chat/[orderId].tsx
// Enhanced Buyer–Seller Campus Chat Screen with quick chips, order banner, and clay styling

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ClayBackButton } from '@components/clay/ClayBackButton';
import {
  Colors,
  Spacing,
  Radius,
  Typography,
  FontSize,
  FontWeight,
  PLACEHOLDER_PRODUCT_IMAGE,
} from '@constants/theme';
import { fetchOrderMessages, sendMessage, fetchOrderById, mockStore, isMockEnabled } from '../../services/api';
import type { Message, Order } from '../../../shared/types';

const QUICK_CHIPS = [
  '📍 I am at the library foyer',
  '☕ Let us meet at SAC Cafe',
  '⏰ Meeting in 10 mins',
  '💸 Sent payment via UPI',
  '✅ Item verified, thank you!',
];

export default function ChatScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const activeUserId = userId || mockStore.getCurrentUserId();

  const loadData = useCallback(async () => {
    if (!orderId) return;
    if (isMockEnabled()) {
      try {
        const localOrder = mockStore.getOrderById(orderId);
        const localMsgs = mockStore.getOrderMessages(orderId);
        setOrder(localOrder);
        setMessages(localMsgs);
      } catch (mockErr) {
        console.warn('[Chat load fallback error]', mockErr);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const token = await getTokenRef.current();
      if (!token) {
        // Fallback to local mock data
        const localOrder = mockStore.getOrderById(orderId);
        const localMsgs = mockStore.getOrderMessages(orderId);
        setOrder(localOrder);
        setMessages(localMsgs);
        return;
      }

      const [orderData, msgData] = await Promise.all([
        fetchOrderById(token, orderId),
        fetchOrderMessages(token, orderId),
      ]);
      setOrder(orderData);
      setMessages(msgData);
    } catch {
      try {
        const localOrder = mockStore.getOrderById(orderId);
        const localMsgs = mockStore.getOrderMessages(orderId);
        setOrder(localOrder);
        setMessages(localMsgs);
      } catch (mockErr) {
        console.warn('[Chat load fallback error]', mockErr);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async (customContent?: string) => {
    const textToSend = (customContent || inputText).trim();
    if (!textToSend || !orderId || sending) return;

    if (!customContent) {
      setInputText('');
    }
    setSending(true);

    if (isMockEnabled()) {
      try {
        const otherUserId =
          order?.buyerId === activeUserId ? (order?.sellerId ?? '') : (order?.buyerId ?? '');
        const localMsg = mockStore.sendMessage({
          orderId,
          content: textToSend,
          receiverId: otherUserId,
        });
        setMessages((prev) => [...prev, localMsg]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      } catch (mockSendErr) {
        console.warn('[Mock send error]', mockSendErr);
      } finally {
        setSending(false);
      }
      return;
    }

    try {
      const token = await getToken();
      const otherUserId =
        order?.buyerId === activeUserId ? (order?.sellerId ?? '') : (order?.buyerId ?? '');

      if (token) {
        const newMsg = await sendMessage(token, {
          orderId,
          content: textToSend,
          receiverId: otherUserId,
        });
        setMessages((prev) => [...prev, newMsg]);
      } else {
        const localMsg = mockStore.sendMessage({
          orderId,
          content: textToSend,
          receiverId: otherUserId,
        });
        setMessages((prev) => [...prev, localMsg]);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (err) {
      console.warn('[Send message error]', err);
    } finally {
      setSending(false);
    }
  };

  const otherPersonName =
    order?.buyerId === activeUserId ? order?.sellerName : order?.buyerName;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <ClayBackButton onPress={() => router.back()} size={38} />

          <View style={styles.personInfoRow}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {otherPersonName ? otherPersonName[0].toUpperCase() : 'U'}
              </Text>
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.personTextBlock}>
              <Text style={styles.personName} numberOfLines={1}>
                {otherPersonName || 'Campus Student'}
              </Text>
              <Text style={styles.personStatus}>Online on campus</Text>
            </View>
          </View>

          {order && (
            <Pressable
              style={styles.orderPillBtn}
              onPress={() => router.push(`/order/${order.id}`)}
            >
              <Ionicons name="receipt-outline" size={14} color="#6C47B2" />
              <Text style={styles.orderPillText}>#{order.id.slice(-4)}</Text>
            </Pressable>
          )}
        </View>

        {/* Product Context Banner */}
        {order && (
          <Pressable
            style={styles.productBanner}
            onPress={() => router.push(`/order/${order.id}`)}
          >
            <Image
              source={{ uri: order.productImage ?? PLACEHOLDER_PRODUCT_IMAGE }}
              style={styles.productThumb}
            />
            <View style={styles.productBannerInfo}>
              <Text style={styles.productBannerTitle} numberOfLines={1}>
                {order.productTitle}
              </Text>
              <Text style={styles.productBannerPrice}>₹{order.amount.toLocaleString('en-IN')}</Text>
              {order.meetupLocation ? (
                <View style={styles.meetupRow}>
                  <Ionicons name="location-sharp" size={11} color="#10B981" />
                  <Text style={styles.meetupText} numberOfLines={1}>
                    {order.meetupLocation}
                  </Text>
                </View>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}

        {/* Message Thread */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>
              Loading messages...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={Typography.bodyBold}>No messages yet</Text>
            <Text style={[Typography.caption, styles.emptyText]}>
              Coordinate your meetup location and timing with {otherPersonName}!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMine = item.senderId === activeUserId;
              const isSystem = item.senderId === 'system';

              if (isSystem) {
                return (
                  <View style={styles.systemBubble}>
                    <Ionicons name="shield-checkmark" size={14} color="#6C47B2" />
                    <Text style={styles.systemText}>{item.content}</Text>
                  </View>
                );
              }

              return (
                <View
                  style={[
                    styles.bubbleWrapper,
                    isMine ? styles.myBubbleWrapper : styles.theirBubbleWrapper,
                  ]}
                >
                  {!isMine && (
                    <Text style={styles.senderLabel}>{item.senderName}</Text>
                  )}
                  <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>
                      {item.content}
                    </Text>
                    <View style={styles.timeRow}>
                      <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {isMine && (
                        <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_CHIPS}
            keyExtractor={(item, idx) => `chip-${idx}`}
            contentContainerStyle={styles.quickChipsContent}
            renderItem={({ item }) => (
              <Pressable style={styles.quickChip} onPress={() => handleSend(item)}>
                <Text style={styles.quickChipText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputPill}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.textInput}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              multiline={false}
            />
          </View>

          <Pressable
            style={[
              styles.sendCircle,
              (!inputText.trim() || sending) && styles.sendCircleDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={Colors.white} style={styles.sendIcon} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE4F7',
    gap: Spacing.sm,
  },
  personInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8A5CD6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarMiniText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  personTextBlock: {
    flex: 1,
  },
  personName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  personStatus: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: FontWeight.semiBold,
  },
  orderPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: '#EDE5FA',
  },
  orderPillText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#6C47B2',
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#FAF7FD',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE4F7',
    gap: Spacing.sm,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  productBannerInfo: {
    flex: 1,
  },
  productBannerTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  productBannerPrice: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#6C47B2',
  },
  meetupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  meetupText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  messagesList: {
    padding: Spacing.base,
    paddingBottom: Spacing.md,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#EFE7FC',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginVertical: Spacing.sm,
    gap: 6,
    maxWidth: '92%',
  },
  systemText: {
    fontSize: 11,
    color: '#553C9A',
    fontWeight: FontWeight.semiBold,
    flexShrink: 1,
  },
  bubbleWrapper: {
    marginBottom: Spacing.sm,
    maxWidth: '82%',
  },
  myBubbleWrapper: {
    alignSelf: 'flex-end',
  },
  theirBubbleWrapper: {
    alignSelf: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 2,
    marginLeft: Spacing.xs,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
  },
  myBubble: {
    backgroundColor: '#6C47B2',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#ECE4F7',
  },
  messageText: {
    fontSize: FontSize.body,
    lineHeight: 20,
  },
  myText: {
    color: Colors.white,
  },
  theirText: {
    color: Colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.75)',
  },
  theirTimeText: {
    color: Colors.textSecondary,
  },
  chipsContainer: {
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#ECE4F7',
  },
  quickChipsContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  quickChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F3EEFA',
    borderWidth: 1,
    borderColor: '#E2D5F5',
  },
  quickChipText: {
    fontSize: 11,
    color: '#6C47B2',
    fontWeight: FontWeight.semiBold,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.sm,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FC',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2D5F5',
    height: 44,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
  },
  sendCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C47B2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  sendCircleDisabled: {
    backgroundColor: '#C5B5DF',
  },
  sendIcon: {
    marginLeft: 2,
  },
});
