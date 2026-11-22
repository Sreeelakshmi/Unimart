// mobile/app/product/[id].tsx
// Product details screen — Displays live product data, seller details, and status badges

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
import { ClayButton, ClayCard, ClayInput, StatusBadge, ClayBackButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, PLACEHOLDER_PRODUCT_IMAGE } from '@constants/theme';
import {
  fetchProductById,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  submitReport,
} from '../../services/api';
import type { Product, ReportReason } from '../../../shared/types';

const PLACEHOLDER_IMAGE = PLACEHOLDER_PRODUCT_IMAGE;

const conditionLabel: Record<string, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [product, setProduct] = useState<Product | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Community report modal states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleSubmitReport = async () => {
    if (!product) return;
    setSubmittingReport(true);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Please sign in to submit a report.');

      await submitReport(token, {
        targetType: 'product',
        targetId: product.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });

      setReportModalVisible(false);
      Alert.alert(
        'Report Submitted 🛡️',
        'Thank you for keeping our campus community safe. A moderator has queued this listing for review.',
      );
    } catch (err) {
      Alert.alert('Report Error', err instanceof Error ? err.message : 'Failed to submit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const token = await getTokenRef.current().catch(() => null);
      const data = await fetchProductById(id, token);
      setProduct(data);
      if (token) {
        checkWishlist(token, id).then((res) => setInWishlist(res.inWishlist)).catch(() => {});
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not load product details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!id) return;
    setWishlistLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Sign In Required', 'Please sign in to save items to your wishlist.');
        return;
      }

      if (inWishlist) {
        await removeFromWishlist(token, id);
        setInWishlist(false);
      } else {
        await addToWishlist(token, id);
        setInWishlist(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ClayCard variant="peach" style={styles.errorCard}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={Typography.bodyBold}>Product Not Available</Text>
          <Text style={[Typography.caption, styles.errorText]}>
            {error || 'This listing may have been removed or is pending approval.'}
          </Text>
          <ClayButton
            label="← Go Back"
            variant="secondary"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.sm }}
          />
        </ClayCard>
      </View>
    );
  }

  const isOwner = product.sellerEmail && product.sellerId === userId;
  const imageSource =
    product.images && product.images.length > 0
      ? { uri: product.images[0] }
      : { uri: PLACEHOLDER_IMAGE };

  return (
    <View style={styles.container}>
      {/* Header with modern circular ClayBackButton */}
      <View style={styles.header}>
        <ClayBackButton size={40} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Main Product Image */}
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />

        <View style={styles.content}>
          {/* Status & verification badges */}
          <View style={styles.badgeRow}>
            <StatusBadge status={product.status} />
            {product.aiVerified && (
              <ClayCard variant="mint" style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✅ AI Verified</Text>
              </ClayCard>
            )}
            {product.status === 'pending_review' && (
              <ClayCard variant="lavender" style={styles.verifiedBadge}>
                <Text style={styles.pendingText}>⏳ In Verification Queue</Text>
              </ClayCard>
            )}
          </View>

          {/* Rejection Reason if applicable */}
          {product.status === 'rejected' && product.rejectionReason && (
            <ClayCard variant="peach" style={styles.rejectionCard}>
              <Text style={Typography.bodyBold}>Moderator Note:</Text>
              <Text style={Typography.caption}>{product.rejectionReason}</Text>
            </ClayCard>
          )}

          {/* Title & Price */}
          <Text style={Typography.h2}>{product.title}</Text>
          <Text style={styles.price}>
            ₹{product.price.toLocaleString('en-IN')}
          </Text>

          {/* Metadata Card */}
          <ClayCard variant="lavender" style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={Typography.captionBold}>Condition</Text>
              <Text style={Typography.caption}>
                {conditionLabel[product.condition] || product.condition}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={Typography.captionBold}>Category</Text>
              <Text style={Typography.caption}>
                {product.category.toUpperCase()}
              </Text>
            </View>
            {product.campusLocation ? (
              <View style={styles.metaRow}>
                <Text style={Typography.captionBold}>Meetup Point</Text>
                <Text style={Typography.caption}>📍 {product.campusLocation}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={Typography.captionBold}>Listed On</Text>
              <Text style={Typography.caption}>
                {new Date(product.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </ClayCard>

          {/* Description */}
          {product.description ? (
            <View style={styles.descBlock}>
              <Text style={[Typography.h3, styles.sectionTitle]}>
                Description
              </Text>
              <Text style={Typography.body}>{product.description}</Text>
            </View>
          ) : null}

          {/* Seller Card */}
          <View style={styles.descBlock}>
            <Text style={[Typography.h3, styles.sectionTitle]}>
              Seller Information
            </Text>
            <ClayCard style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerAvatarText}>
                  {product.sellerName ? product.sellerName[0].toUpperCase() : 'S'}
                </Text>
              </View>
              <View style={styles.sellerMeta}>
                <Text style={Typography.bodyBold}>{product.sellerName}</Text>
                {product.sellerEmail && (
                  <Text style={Typography.caption}>{product.sellerEmail}</Text>
                )}
              </View>
            </ClayCard>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {isOwner ? (
              <ClayButton
                label="Manage in Seller Dashboard"
                variant="primary"
                onPress={() => router.push('/seller/dashboard')}
                style={styles.actionButton}
              />
            ) : (
              <>
                {product.status === 'available' || product.status === 'verified' ? (
                  <ClayButton
                    label="Buy Now (Campus Meetup)"
                    variant="primary"
                    onPress={() => router.push(`/order/checkout/${product.id}`)}
                    style={styles.actionButton}
                  />
                ) : (
                  <ClayButton
                    label={`Product ${product.status.replace('_', ' ').toUpperCase()}`}
                    variant="secondary"
                    disabled
                    style={styles.actionButton}
                  />
                )}
                <ClayButton
                  label={inWishlist ? '♥ Saved in Wishlist' : '♡ Add to Wishlist'}
                  variant={inWishlist ? 'primary' : 'secondary'}
                  onPress={handleToggleWishlist}
                  loading={wishlistLoading}
                  style={styles.actionButton}
                />
                <ClayButton
                  label="🚩 Report Listing"
                  variant="ghost"
                  onPress={() => setReportModalVisible(true)}
                  style={styles.actionButton}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Community Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ClayCard variant="peach" style={styles.modalCard}>
            <Text style={Typography.h3}>Report Listing 🛡️</Text>
            <Text style={[Typography.caption, { marginVertical: Spacing.xs }]}>
              Help keep the campus marketplace safe. Select reason for reporting this listing:
            </Text>

            <View style={{ gap: Spacing.xs, marginVertical: Spacing.sm }}>
              {(
                [
                  { label: 'Spam or Misleading', val: 'spam' },
                  { label: 'Inappropriate Content', val: 'inappropriate' },
                  { label: 'Suspected Scam', val: 'scam' },
                  { label: 'Counterfeit / Replica', val: 'counterfeit' },
                  { label: 'Harassment or Abuse', val: 'harassment' },
                  { label: 'Other Guideline Violation', val: 'other' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.val}
                  onPress={() => setReportReason(opt.val)}
                  style={{
                    padding: Spacing.sm,
                    borderRadius: Radius.sm,
                    backgroundColor: reportReason === opt.val ? Colors.primary : Colors.white,
                  }}
                >
                  <Text
                    style={[
                      Typography.captionBold,
                      { color: reportReason === opt.val ? Colors.white : Colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <ClayInput
              label="Additional Details (Optional)"
              value={reportDetails}
              onChangeText={setReportDetails}
              placeholder="Provide extra context for student moderators..."
              multiline
              numberOfLines={3}
            />

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <ClayButton
                label={submittingReport ? 'Submitting...' : 'Submit Report'}
                variant="primary"
                onPress={handleSubmitReport}
                loading={submittingReport}
                style={{ flex: 1 }}
              />
              <ClayButton
                label="Cancel"
                variant="ghost"
                onPress={() => setReportModalVisible(false)}
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
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  header: { paddingHorizontal: Spacing.sm, paddingTop: Spacing.xxl },
  scroll: { paddingBottom: Spacing.xxxl },
  image: { width: '100%', height: 260 },
  content: { padding: Spacing.base, gap: Spacing.base },
  badgeRow: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', flexWrap: 'wrap' },
  verifiedBadge: { paddingVertical: 4, paddingHorizontal: 10 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#1A7A52' },
  pendingText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  rejectionCard: { padding: Spacing.sm, gap: 2 },
  price: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  metaCard: { gap: Spacing.sm },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  descBlock: { gap: Spacing.xs },
  sectionTitle: { marginBottom: 2 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  sellerMeta: { flex: 1, gap: 2 },
  actions: { gap: Spacing.sm, marginTop: Spacing.sm },
  actionButton: { width: '100%' },
  errorCard: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  errorEmoji: { fontSize: 40 },
  errorText: { color: Colors.error, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 41, 73, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: { width: '100%', maxWidth: 400, padding: Spacing.lg },
});
