// mobile/app/order/checkout/[id].tsx
// Checkout & Campus Meetup Order Placement Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ClayHeader, ClayCard, ClayInput, ClayButton, StatusBadge } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight, PLACEHOLDER_PRODUCT_IMAGE } from '@constants/theme';
import {
  fetchProductById,
  createOrder,
  fetchMeetupLocations,
  initiatePayment,
  verifyPayment,
} from '../../../services/api';
import type { Product, CampusMeetupLocation, PaymentMethod } from '../../../../shared/types';

const PLACEHOLDER_IMAGE = PLACEHOLDER_PRODUCT_IMAGE;

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [certifiedLocations, setCertifiedLocations] = useState<CampusMeetupLocation[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi_demo');
  const [error, setError] = useState<string | null>(null);

  const loadProductAndLocations = useCallback(async () => {
    if (!id) return;
    try {
      const token = await getTokenRef.current();
      const [productData, locationsData] = await Promise.all([
        fetchProductById(id, token),
        fetchMeetupLocations().catch(() => []),
      ]);
      setProduct(productData);
      setCertifiedLocations(locationsData);
      if (productData.campusLocation) {
        setMeetupLocation(productData.campusLocation);
      } else if (locationsData.length > 0) {
        setMeetupLocation(locationsData[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load checkout data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProductAndLocations();
  }, [loadProductAndLocations]);

  const handlePlaceOrder = async () => {
    if (!product || !id) return;
    setError(null);

    if (product.sellerEmail && product.sellerId === userId) {
      setError('You cannot place an order for your own listing.');
      return;
    }

    if (product.status !== 'available' && product.status !== 'verified') {
      setError('This product is no longer available for purchase.');
      return;
    }

    if (!meetupLocation.trim()) {
      setError('Please specify a campus meetup point.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Please sign in to place an order.');

      const order = await createOrder(token, {
        productId: id,
        amount: product.price,
        meetupLocation: meetupLocation.trim(),
        meetupTime: meetupTime.trim() ? new Date(Date.now() + 24 * 3600 * 1000).toISOString() : undefined,
      });

      if (paymentMethod === 'upi_demo') {
        // Initiate and verify digital UPI sandbox payment
        const paymentInit = await initiatePayment(token, {
          orderId: order.id,
          method: 'upi_demo',
        });
        await verifyPayment(token, {
          orderId: order.id,
          transactionRef: paymentInit.transactionRef,
          paymentMethod: 'upi_demo',
        });
      }

      Alert.alert(
        'Order Placed! 🎉',
        paymentMethod === 'upi_demo'
          ? 'Your order request was confirmed with verified digital UPI sandbox payment. Coordinate meetup in chat!'
          : 'Your order request was sent to the seller. Pay cash upon physical meetup inspection.',
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/order/${order.id}`),
          },
        ],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading checkout...</Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ClayCard variant="peach" style={styles.errorCard}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={Typography.bodyBold}>Cannot Checkout</Text>
          <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
          <ClayButton label="Go Back" variant="secondary" onPress={() => router.back()} style={{ marginTop: Spacing.sm }} />
        </ClayCard>
      </View>
    );
  }

  const imageUri = product?.images && product.images.length > 0 ? product.images[0] : PLACEHOLDER_IMAGE;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <ClayHeader title="Checkout" subtitle="Confirm campus pickup & meetup details" showBack={true} />

        {/* Product summary card */}
        {product && (
          <ClayCard style={styles.summaryCard}>
            <Image source={{ uri: imageUri }} style={styles.thumbnail} />
            <View style={styles.summaryInfo}>
              <Text style={Typography.bodyBold} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
              <Text style={Typography.caption}>Seller: {product.sellerName}</Text>
              <View style={{ marginTop: Spacing.xs }}>
                <StatusBadge status={product.status} />
              </View>
            </View>
          </ClayCard>
        )}

        {/* Meetup Coordination Form */}
        <ClayCard variant="lavender" style={styles.formCard}>
          <Text style={[Typography.h3, styles.sectionTitle]}>Campus Meetup Details</Text>
          <Text style={[Typography.caption, styles.infoNote]}>
            🤝 Campus Marketplace transactions happen in person on campus. Coordinate where and when to meet the seller.
          </Text>

          {error ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Certified Campus Safe Meetup Points */}
          {certifiedLocations.length > 0 && (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={[Typography.captionBold, styles.fieldLabel]}>
                🛡️ Certified Safe Campus Meetup Zones:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: Spacing.xs }}>
                <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
                  {certifiedLocations.map((loc) => {
                    const isSelected = meetupLocation === loc.name;
                    return (
                      <ClayButton
                        key={loc.id}
                        label={loc.name}
                        variant={isSelected ? 'primary' : 'ghost'}
                        onPress={() => setMeetupLocation(loc.name)}
                        style={{ paddingHorizontal: Spacing.sm }}
                      />
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Preferred Meetup Point *</Text>
          <ClayInput
            value={meetupLocation}
            onChangeText={setMeetupLocation}
            placeholder="e.g. University Library Ground Floor, North Gate Cafe"
          />

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Preferred Date / Time Note</Text>
          <ClayInput
            value={meetupTime}
            onChangeText={setMeetupTime}
            placeholder="e.g. Tomorrow between 2 PM - 4 PM"
          />

          {/* Payment Method Selector */}
          <Text style={[Typography.captionBold, styles.fieldLabel, { marginTop: Spacing.md }]}>
            💳 Select Payment Method:
          </Text>
          <View style={{ gap: Spacing.xs, marginBottom: Spacing.md }}>
            <ClayButton
              label={
                paymentMethod === 'upi_demo'
                  ? '✓ ⚡ UPI Digital (Verified Campus Sandbox)'
                  : '⚡ UPI Digital (Verified Campus Sandbox)'
              }
              variant={paymentMethod === 'upi_demo' ? 'primary' : 'ghost'}
              onPress={() => setPaymentMethod('upi_demo')}
            />
            <ClayButton
              label={
                paymentMethod === 'cash_on_meetup'
                  ? '✓ 💵 Cash on Campus Meetup'
                  : '💵 Cash on Campus Meetup'
              }
              variant={paymentMethod === 'cash_on_meetup' ? 'primary' : 'ghost'}
              onPress={() => setPaymentMethod('cash_on_meetup')}
            />
          </View>

          {/* Payment Note */}
          <ClayCard variant="mint" style={styles.paymentNoteCard}>
            <Text style={Typography.captionBold}>
              {paymentMethod === 'upi_demo' ? '⚡ UPI Sandbox Demonstration' : '💵 Cash on Exchange'}
            </Text>
            <Text style={Typography.caption}>
              {paymentMethod === 'upi_demo'
                ? 'Backend-verified UPI simulation. No real money will be deducted from your bank.'
                : 'Inspect the item in person and pay the student cash directly upon handover.'}
            </Text>
          </ClayCard>

          <View style={styles.buttonRow}>
            <ClayButton
              label={submitting ? 'Placing Order...' : `Confirm Order (₹${product?.price.toLocaleString('en-IN')})`}
              onPress={handlePlaceOrder}
              loading={submitting}
              style={styles.confirmBtn}
            />
            <ClayButton
              label="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              style={styles.cancelBtn}
            />
          </View>
        </ClayCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorCard: { padding: Spacing.lg, alignItems: 'center', width: '100%' },
  errorEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
  summaryCard: { flexDirection: 'row', padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  thumbnail: { width: 84, height: 84, borderRadius: Radius.md, marginRight: Spacing.md },
  summaryInfo: { flex: 1 },
  price: { fontSize: FontSize.h3, fontWeight: FontWeight.bold, color: Colors.text, marginVertical: Spacing.xs },
  formCard: { padding: Spacing.md },
  sectionTitle: { marginBottom: Spacing.xs },
  infoNote: { color: Colors.textSecondary, marginBottom: Spacing.md },
  fieldLabel: { color: Colors.text, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  paymentNoteCard: { padding: Spacing.sm, marginTop: Spacing.md, marginBottom: Spacing.md },
  buttonRow: { gap: Spacing.sm },
  confirmBtn: { width: '100%' },
  cancelBtn: { width: '100%' },
  inlineError: {
    backgroundColor: Colors.peach,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  inlineErrorText: { color: Colors.error, fontSize: FontSize.caption },
});

