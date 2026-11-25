// mobile/app/product/[id].tsx
// Product details screen — High-impact visual hero, animated floating header, sticky action bar, and clay surfaces

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { ClayButton, ClayCard, ClayInput, StatusBadge, ClayBackButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, clayElevation, PLACEHOLDER_PRODUCT_IMAGE } from '@constants/theme';
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
  like_new: 'Like New (Flawless)',
  good: 'Good (Gently Used)',
  fair: 'Fair (Functional)',
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [product, setProduct] = useState<Product | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Heart bounce animation
  const heartScale = useRef(new Animated.Value(1)).current;

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
      const msg = err instanceof Error ? err.message : 'Could not load product details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!id) return;
    setWishlistLoading(true);

    // Spring bounce animation on wishlist toggle
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        friction: 3,
        tension: 180,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }),
    ]).start();

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
        <ActivityIndicator color="#8B64DC" size="large" />
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
      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <ClayBackButton size={42} />

        <Pressable
          style={styles.floatingHeartBtn}
          onPress={handleToggleWishlist}
          hitSlop={10}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={inWishlist ? '#FF4B72' : '#7B6E8D'}
            />
          </Animated.View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Product Hero Image */}
        <View style={styles.heroImageWrapper}>
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />

          {/* Badges Overlay */}
          <View style={styles.heroBadgeRow}>
            <StatusBadge status={product.status} />
            {product.aiVerified && (
              <View style={styles.aiVerifiedPill}>
                <Ionicons name="sparkles" size={13} color="#166542" />
                <Text style={styles.aiVerifiedText}>AI Verified</Text>
              </View>
            )}
            {product.status === 'pending_review' && (
              <View style={styles.queuePill}>
                <Ionicons name="time" size={13} color="#6C47B2" />
                <Text style={styles.queueText}>In Verification</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Price & Title Banner */}
          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{product.category.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrency}>₹</Text>
              <Text style={styles.priceAmount}>
                {product.price.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Rejection Note if applicable */}
          {product.status === 'rejected' && product.rejectionReason && (
            <ClayCard variant="peach" style={styles.rejectionCard}>
              <Ionicons name="warning-outline" size={18} color={Colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={Typography.bodyBold}>Moderator Note:</Text>
                <Text style={Typography.caption}>{product.rejectionReason}</Text>
              </View>
            </ClayCard>
          )}

          {/* Key Item Specs in Clay Grid */}
          <View style={styles.specsRow}>
            <View style={styles.specBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#6C47B2" />
              <Text style={styles.specLabel}>Condition</Text>
              <Text style={styles.specValue}>
                {conditionLabel[product.condition] || product.condition}
              </Text>
            </View>

            <View style={styles.specBox}>
              <Ionicons name="location-outline" size={18} color="#6C47B2" />
              <Text style={styles.specLabel}>Safe Meetup</Text>
              <Text style={styles.specValue} numberOfLines={1}>
                {product.campusLocation ?? 'Library Foyer'}
              </Text>
            </View>
          </View>

          {/* Description Section */}
          {product.description ? (
            <ClayCard style={styles.descCard}>
              <Text style={styles.sectionHeaderTitle}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </ClayCard>
          ) : null}

          {/* Student Seller Card */}
          <ClayCard style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {product.sellerName ? product.sellerName[0].toUpperCase() : 'S'}
              </Text>
            </View>
            <View style={styles.sellerMeta}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sellerName}>{product.sellerName ?? 'Student Seller'}</Text>
                <Ionicons name="checkmark-circle" size={15} color="#166542" />
              </View>
              <Text style={styles.sellerRole}>Ramaiah University Student</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9 (24 trades completed)</Text>
              </View>
            </View>
          </ClayCard>

          {/* Report Button */}
          <Pressable
            onPress={() => setReportModalVisible(true)}
            style={styles.reportRow}
          >
            <Ionicons name="flag-outline" size={14} color="#8C7D9E" />
            <Text style={styles.reportText}>Report this listing to campus moderators</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {isOwner ? (
          <ClayButton
            label="Manage in Seller Dashboard"
            variant="primary"
            onPress={() => router.push('/seller/dashboard')}
            style={{ flex: 1 }}
          />
        ) : product.status === 'available' || product.status === 'verified' ? (
          <View style={styles.actionButtonGroup}>
            <ClayButton
              label="Chat"
              variant="secondary"
              icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#6C47B2" />}
              onPress={() => router.push('/(tabs)/chats')}
              style={styles.chatButton}
            />
            <ClayButton
              label="Buy Now (UPI Escrow)"
              variant="primary"
              icon={<Ionicons name="flash-outline" size={18} color={Colors.white} />}
              onPress={() => router.push(`/order/checkout/${product.id}`)}
              style={styles.buyButton}
            />
          </View>
        ) : (
          <ClayButton
            label={`Product ${product.status.replace('_', ' ').toUpperCase()}`}
            variant="secondary"
            disabled
            style={{ flex: 1 }}
          />
        )}
      </View>

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
                    backgroundColor: reportReason === opt.val ? '#8B64DC' : Colors.white,
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
  container: {
    flex: 1,
    backgroundColor: '#F7F3FB',
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 38,
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingHeartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    ...clayElevation,
  },
  scroll: {
    paddingBottom: 110,
  },
  heroImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 310,
    backgroundColor: '#ECE4F7',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    ...clayElevation,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeRow: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.base,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  aiVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(207, 242, 226, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#B2EAD2',
    gap: 4,
  },
  aiVerifiedText: {
    color: '#166542',
    fontSize: 11,
    fontWeight: '800',
  },
  queuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 223, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#D8C9FA',
    gap: 4,
  },
  queueText: {
    color: '#6C47B2',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  categoryPill: {
    backgroundColor: '#EFE7FC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 2,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C47B2',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#EFE7FC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#D8C9FA',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6C47B2',
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C47B2',
  },
  rejectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  specBox: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    alignItems: 'center',
    gap: 4,
    ...clayElevation,
  },
  specLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  descCard: {
    padding: Spacing.base,
    gap: 6,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: 14,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B64DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D8C9FA',
  },
  sellerAvatarText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 20,
  },
  sellerMeta: {
    flex: 1,
    gap: 2,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  sellerRole: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '700',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  reportText: {
    fontSize: 12,
    color: '#8C7D9E',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1.5,
    borderTopColor: '#ECE4F7',
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  chatButton: {
    flex: 1,
    minHeight: 50,
  },
  buyButton: {
    flex: 2,
    minHeight: 50,
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 41, 73, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.lg,
  },
});
