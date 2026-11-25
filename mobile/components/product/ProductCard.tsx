// mobile/components/product/ProductCard.tsx
// High-tactile animated product card with claymorphism styling, spring press feedback, and bounce heart animation

import React, { memo, useRef } from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  type ViewStyle,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import type { Product } from '@shared/index';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  clayElevation,
  PLACEHOLDER_PRODUCT_IMAGE,
} from '@constants/theme';

interface ProductCardProps {
  product: Product;
  style?: ViewStyle;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

function ProductCardComponent({
  product,
  style,
  isWishlisted,
  onWishlistToggle,
}: ProductCardProps) {
  const router = useRouter();
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  };

  const handleHeartPress = (e: any) => {
    e.stopPropagation();
    // Bouncy heart animation
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.35,
        useNativeDriver: true,
        friction: 4,
        tension: 180,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }),
    ]).start();

    onWishlistToggle?.();
  };

  const conditionText = product.condition
    ? product.condition.replace('_', ' ').toUpperCase()
    : 'GOOD';

  return (
    <Animated.View style={[{ transform: [{ scale: cardScale }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/product/${product.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`${product.title}, ₹${product.price}`}
        style={styles.cardContainer}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.images[0] ?? PLACEHOLDER_PRODUCT_IMAGE }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={120}
            accessibilityIgnoresInvertColors
          />

          {/* Condition pill overlay */}
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{conditionText}</Text>
          </View>

          {/* Status badge overlay */}
          <View style={styles.statusOverlay}>
            <StatusBadge status={product.status} />
          </View>

          {/* Animated Wishlist Heart Button */}
          {onWishlistToggle && (
            <Pressable
              style={styles.heartButton}
              onPress={handleHeartPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={isWishlisted ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isWishlisted ? '#FF4B72' : '#7B6E8D'}
                />
              </Animated.View>
            </Pressable>
          )}
        </View>

        {/* Info Container */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.price}>
              {product.price.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.sellerRow}>
            <Ionicons name="person-circle-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.seller} numberOfLines={1}>
              {product.sellerName ?? 'Student Seller'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#ECE4F7',
    overflow: 'hidden',
    ...clayElevation,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: '#F7F3FB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.border,
  },
  conditionBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(52, 41, 73, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  conditionText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
  },
  statusOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: Radius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#B9A0EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  info: {
    padding: Spacing.md,
    gap: 3,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  currencySymbol: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: '#6C47B2',
  },
  price: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: '#6C47B2',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  seller: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    fontWeight: FontWeight.regular,
  },
});

export const ProductCard = memo(ProductCardComponent);
