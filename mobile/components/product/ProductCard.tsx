// mobile/components/product/ProductCard.tsx
// Product listing card with clay styling, image, price and status badge (memoized for 60fps scrolling)

import React, { memo } from 'react';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ClayCard } from '@components/clay/ClayCard';
import { StatusBadge } from './StatusBadge';
import type { Product } from '@shared/index';
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
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

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ₹${product.price}`}
      style={style}
    >
      <ClayCard style={styles.card}>
        {/* Image with status badge overlay — clipped at wrapper level */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.images[0] ?? PLACEHOLDER_PRODUCT_IMAGE }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={100}
            accessibilityIgnoresInvertColors
          />
          <View style={styles.badgeOverlay}>
            <StatusBadge status={product.status} />
          </View>
          {onWishlistToggle && (
            <Pressable
              style={styles.heartButton}
              onPress={(e) => {
                e.stopPropagation();
                onWishlistToggle();
              }}
            >
              <Text style={styles.heartText}>{isWishlisted ? '❤️' : '🤍'}</Text>
            </Pressable>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.seller} numberOfLines={1}>
            {product.sellerName}
          </Text>
        </View>
      </ClayCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    // Outer card does not use overflow: 'hidden' on Android to maintain hardware-accelerated elevation
  },
  imageWrapper: {
    position: 'relative',
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.border,
  },
  badgeOverlay: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: Radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 14,
  },
  info: {
    padding: Spacing.md,
    gap: 2,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
  },
  price: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  seller: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
});

export const ProductCard = memo(ProductCardComponent);
