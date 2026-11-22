// mobile/app/order/[id].tsx
// Order Details & Lifecycle Coordination Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ClayHeader, ClayCard, ClayButton, ClayInput, StatusBadge } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight, PLACEHOLDER_PRODUCT_IMAGE } from '@constants/theme';
import { fetchOrderById, updateOrderStatus, submitReturnRequest } from '../../services/api';
import type { Order, ReturnReason } from '../../../shared/types';

const PLACEHOLDER_IMAGE = PLACEHOLDER_PRODUCT_IMAGE;

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return / refund modal states
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnReason, setReturnReason] = useState<ReturnReason>('not_as_described');
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Authentication required.');
      const data = await fetchOrderById(token, id);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async (newStatus: Order['status'], confirmMessage: string) => {
    if (!id) return;
    Alert.alert('Update Order', confirmMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(true);
          try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated.');
            const updated = await updateOrderStatus(token, id, { status: newStatus });
            setOrder(updated);
            Alert.alert('Success', `Order status updated to ${newStatus.replace('_', ' ')}.`);
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not update status.');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const handleSubmitReturn = async () => {
    if (!order) return;
    setSubmittingReturn(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated.');

      await submitReturnRequest(token, {
        orderId: order.id,
        reason: returnReason,
        details: returnDetails.trim() || undefined,
      });

      setReturnModalVisible(false);
      Alert.alert(
        'Return Request Submitted 🔄',
        'Your return/refund request was recorded and sent to the seller for review.',
      );
    } catch (err) {
      Alert.alert('Return Error', err instanceof Error ? err.message : 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ClayCard variant="peach" style={styles.errorCard}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={Typography.bodyBold}>Order Not Available</Text>
          <Text style={[Typography.caption, styles.errorText]}>{error || 'Order record not found.'}</Text>
          <ClayButton label="← Go Back" variant="secondary" onPress={() => router.back()} style={{ marginTop: Spacing.sm }} />
        </ClayCard>
      </View>
    );
  }

  const isSeller = order.sellerId === userId;
  const isBuyer = order.buyerId === userId;
  const imageUri = order.productImage || PLACEHOLDER_IMAGE;

  return (
    <View style={styles.container}>
      <ClayHeader
        title={`Order #${order.id.slice(0, 8)}`}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status banner card */}
        <ClayCard variant="lavender" style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={Typography.bodyBold}>Order Lifecycle Status</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={[Typography.caption, { marginTop: Spacing.xs, color: Colors.textSecondary }]}>
            {order.status === 'placed'
              ? 'Waiting for seller to confirm the order.'
              : order.status === 'confirmed'
              ? 'Seller confirmed! Coordinate meetup details below.'
              : order.status === 'meetup_arranged'
              ? 'Meetup arranged! Meet the student to exchange goods.'
              : order.status === 'completed'
              ? 'Order completed successfully! 🎉'
              : 'Order was cancelled.'}
          </Text>
        </ClayCard>

        {/* Product Information */}
        <ClayCard style={styles.card}>
          <View style={styles.productRow}>
            <Image source={{ uri: imageUri }} style={styles.thumbnail} />
            <View style={styles.productInfo}>
              <Text style={Typography.bodyBold} numberOfLines={2}>{order.productTitle}</Text>
              <Text style={styles.price}>₹{order.amount.toLocaleString('en-IN')}</Text>
              <ClayButton
                label="View Product"
                variant="ghost"
                onPress={() => router.push(`/product/${order.productId}`)}
                style={styles.viewProductBtn}
              />
            </View>
          </View>
        </ClayCard>

        {/* Meetup Information */}
        <ClayCard variant="mint" style={styles.card}>
          <Text style={[Typography.h3, styles.sectionTitle]}>📍 Meetup Location</Text>
          <Text style={Typography.bodyBold}>{order.meetupLocation || 'Campus Center'}</Text>
          {order.meetupTime ? (
            <Text style={[Typography.caption, { marginTop: Spacing.xs }]}>
              ⏰ Preferred Time: {new Date(order.meetupTime).toLocaleString()}
            </Text>
          ) : null}
        </ClayCard>

        {/* Digital Payment Reference if verified */}
        {order.paymentRef && (
          <ClayCard variant="lavender" style={styles.card}>
            <Text style={Typography.captionBold}>💳 Verified Digital Payment</Text>
            <Text style={[Typography.caption, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
              Transaction Reference: {order.paymentRef}
            </Text>
          </ClayCard>
        )}

        {/* Participants Information */}
        <ClayCard style={styles.card}>
          <Text style={[Typography.h3, styles.sectionTitle]}>Parties Involved</Text>
          <View style={styles.partyRow}>
            <Text style={Typography.captionBold}>Buyer:</Text>
            <Text style={Typography.body}>{order.buyerName} {isBuyer ? '(You)' : ''}</Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={Typography.captionBold}>Seller:</Text>
            <Text style={Typography.body}>{order.sellerName} {isSeller ? '(You)' : ''}</Text>
          </View>
        </ClayCard>

        {/* Communication & Actions */}
        <View style={styles.actionSection}>
          {/* Chat with other student */}
          <ClayButton
            label="💬 Chat with Student"
            variant="primary"
            onPress={() => router.push(`/chat/${order.id}`)}
            style={styles.actionBtn}
          />

          {/* Seller actions for 'placed' */}
          {isSeller && order.status === 'placed' && (
            <>
              <ClayButton
                label="Confirm Order Request"
                variant="primary"
                onPress={() => handleUpdateStatus('confirmed', 'Confirm this incoming order?')}
                loading={updating}
                style={styles.actionBtn}
              />
              <ClayButton
                label="Decline Order"
                variant="secondary"
                onPress={() => handleUpdateStatus('cancelled', 'Decline and cancel this order request?')}
                loading={updating}
                style={styles.actionBtn}
              />
            </>
          )}

          {/* Arranging meetup transition */}
          {order.status === 'confirmed' && (
            <ClayButton
              label="Mark Meetup Arranged"
              variant="secondary"
              onPress={() => handleUpdateStatus('meetup_arranged', 'Confirm that meetup time and location are agreed?')}
              loading={updating}
              style={styles.actionBtn}
            />
          )}

          {/* Seller completing fulfillment */}
          {isSeller && order.status === 'meetup_arranged' && (
            <ClayButton
              label="Mark Completed & Handed Over"
              variant="primary"
              onPress={() => handleUpdateStatus('completed', 'Confirm item handed over and payment received?')}
              loading={updating}
              style={styles.actionBtn}
            />
          )}

          {/* Buyer requesting return/refund on completed order */}
          {isBuyer && order.status === 'completed' && (
            <ClayButton
              label="🔄 Request Return / Refund"
              variant="secondary"
              onPress={() => setReturnModalVisible(true)}
              style={styles.actionBtn}
            />
          )}

          {/* Back button */}
          <ClayButton
            label="← Back to Orders"
            variant="ghost"
            onPress={() => router.push('/orders')}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Return Request Modal */}
      <Modal
        visible={returnModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReturnModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard variant="lavender" style={styles.modalCard}>
            <Text style={Typography.h3}>Request Return / Refund 🔄</Text>
            <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>
              Campus transactions are backed by mutual verification. Select the reason for your refund request:
            </Text>

            <View style={{ gap: Spacing.xs, marginVertical: Spacing.sm }}>
              {(
                [
                  { label: 'Item Not as Described', val: 'not_as_described' },
                  { label: 'Defective / Damaged', val: 'defective' },
                  { label: 'Wrong Item Provided', val: 'wrong_item' },
                  { label: 'Other Concern', val: 'other' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.val}
                  onPress={() => setReturnReason(opt.val)}
                  style={{
                    padding: Spacing.sm,
                    borderRadius: Radius.sm,
                    backgroundColor: returnReason === opt.val ? Colors.primary : Colors.white,
                  }}
                >
                  <Text
                    style={[
                      Typography.captionBold,
                      { color: returnReason === opt.val ? Colors.white : Colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ClayInput
              label="Details / Notes (Optional)"
              value={returnDetails}
              onChangeText={setReturnDetails}
              placeholder="Explain the issue with the item..."
              multiline
              numberOfLines={3}
            />

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <ClayButton
                label={submittingReturn ? 'Submitting...' : 'Submit Request'}
                variant="primary"
                onPress={handleSubmitReturn}
                loading={submittingReturn}
                style={{ flex: 1 }}
              />
              <ClayButton
                label="Cancel"
                variant="ghost"
                onPress={() => setReturnModalVisible(false)}
                style={{ flex: 1 }}
              />
            </View>
          </ClayCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorCard: { padding: Spacing.lg, alignItems: 'center', width: '100%' },
  errorEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
  card: { padding: Spacing.md, marginBottom: Spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 72, height: 72, borderRadius: Radius.md, marginRight: Spacing.md },
  productInfo: { flex: 1 },
  price: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.xs },
  viewProductBtn: { alignSelf: 'flex-start', marginTop: Spacing.xs },
  sectionTitle: { marginBottom: Spacing.xs },
  partyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  actionSection: { gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: { width: '100%' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 41, 73, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: { width: '100%', maxWidth: 400, padding: Spacing.lg },
});

