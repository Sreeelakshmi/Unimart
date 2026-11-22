// mobile/app/seller/edit/[id].tsx
// Edit Product Screen — Allows sellers to edit their listings with claymorphism UI

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { ClayHeader, ClayCard, ClayInput, ClayButton, StatusBadge } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight } from '@constants/theme';
import { fetchProductById, updateProduct, uploadProductImages } from '../../../services/api';
import type { Product, ProductCategory, ProductCondition } from '../../../../shared/types';

const CATEGORIES: Array<{ label: string; value: ProductCategory }> = [
  { label: '📚 Books', value: 'books' },
  { label: '📱 Electronics', value: 'electronics' },
  { label: '👕 Clothing', value: 'clothing' },
  { label: '✏️ Stationery', value: 'stationery' },
  { label: '⚽ Sports', value: 'sports' },
  { label: '🪑 Furniture', value: 'furniture' },
  { label: '🍔 Food', value: 'food' },
  { label: '📦 Other', value: 'other' },
];

const CONDITIONS: Array<{ label: string; value: ProductCondition }> = [
  { label: '✨ Brand New', value: 'new' },
  { label: '👍 Like New', value: 'like_new' },
  { label: '👌 Good', value: 'good' },
  { label: '📦 Fair', value: 'fair' },
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken, userId } = useAuth();
  const getTokenRef = React.useRef(getToken);
  getTokenRef.current = getToken;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('books');
  const [condition, setCondition] = useState<ProductCondition>('good');
  const [description, setDescription] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('Authentication required.');
      const data = await fetchProductById(id, token);
      setProduct(data);
      setTitle(data.title);
      setPrice(data.price.toString());
      setCategory(data.category);
      setCondition(data.condition);
      setDescription(data.description || '');
      setCampusLocation(data.campusLocation || '');
      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listing for editing.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Access to photos is required to add product images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, ...newUris].slice(0, 5));
      }
    } catch {
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!id) return;
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated.');

      // Check if new local file URIs need uploading
      const localUris = images.filter((uri) => uri.startsWith('file://') || uri.startsWith('ph://'));
      const existingUrls = images.filter((uri) => !uri.startsWith('file://') && !uri.startsWith('ph://'));

      let finalImages = [...existingUrls];
      if (localUris.length > 0) {
        try {
          const uploadedUrls = await uploadProductImages(token, localUris);
          finalImages = [...finalImages, ...uploadedUrls];
        } catch (uploadErr) {
          console.warn('[Image upload warning]', uploadErr);
        }
      }

      await updateProduct(token, id, {
        title: title.trim(),
        price: numPrice,
        category,
        condition,
        description: description.trim() || undefined,
        campusLocation: campusLocation.trim() || undefined,
        images: finalImages,
      });

      Alert.alert(
        'Listing Updated',
        product?.status === 'rejected'
          ? 'Your listing has been updated and resubmitted for admin review.'
          : 'Your changes have been saved.',
        [{ text: 'OK', onPress: () => router.replace('/seller/dashboard') }],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={[Typography.caption, { marginTop: Spacing.sm }]}>Loading listing details...</Text>
      </View>
    );
  }

  if (error && !product) {
    return (
      <View style={[styles.container, styles.centerBox]}>
        <ClayCard variant="peach" style={styles.errorCard}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={Typography.bodyBold}>Cannot Edit Listing</Text>
          <Text style={[Typography.caption, styles.errorText]}>{error}</Text>
          <ClayButton label="Go Back" variant="secondary" onPress={() => router.back()} style={{ marginTop: Spacing.sm }} />
        </ClayCard>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <ClayHeader title="Edit Listing" subtitle="Update your item details or price" />

        {/* Current status display */}
        {product && (
          <ClayCard variant="lavender" style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={Typography.bodyBold}>Current Status:</Text>
              <StatusBadge status={product.status} />
            </View>
            {product.status === 'rejected' && product.rejectionReason ? (
              <View style={styles.rejectedBanner}>
                <Text style={Typography.captionBold}>Rejection Note:</Text>
                <Text style={Typography.caption}>{product.rejectionReason}</Text>
                <Text style={[Typography.caption, { color: Colors.primary, marginTop: Spacing.xs }]}>
                  💡 Updating and saving will resubmit this item for review.
                </Text>
              </View>
            ) : null}
          </ClayCard>
        )}

        {/* Form fields */}
        <ClayCard style={styles.card}>
          {error ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Item Title *</Text>
          <ClayInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Engineering Mathematics II"
            maxLength={120}
          />

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Price (₹) *</Text>
          <ClayInput
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 450"
            keyboardType="numeric"
          />

          {/* Category Chips */}
          <Text style={[Typography.captionBold, styles.fieldLabel]}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                style={[styles.chip, category === cat.value && styles.chipActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Condition Chips */}
          <Text style={[Typography.captionBold, styles.fieldLabel]}>Condition *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {CONDITIONS.map((cond) => (
              <Pressable
                key={cond.value}
                style={[styles.chip, condition === cond.value && styles.chipActive]}
                onPress={() => setCondition(cond.value)}
              >
                <Text style={[styles.chipText, condition === cond.value && styles.chipTextActive]}>
                  {cond.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Campus Meetup Location</Text>
          <ClayInput
            value={campusLocation}
            onChangeText={setCampusLocation}
            placeholder="e.g. Library 2nd Floor, Central Cafeteria"
          />

          <Text style={[Typography.captionBold, styles.fieldLabel]}>Description</Text>
          <ClayInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe condition, edition, accessories..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          {/* Image Previews & Picker */}
          <Text style={[Typography.captionBold, styles.fieldLabel]}>
            Photos ({images.length}/5)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {images.map((imgUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imgUri }} style={styles.thumbnail} />
                <Pressable
                  style={styles.removeBadge}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeBadgeText}>✕</Text>
                </Pressable>
              </View>
            ))}
            {images.length < 5 && (
              <Pressable style={styles.addPhotoSlot} onPress={handlePickImages}>
                <Text style={styles.addPhotoIcon}>📷</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </Pressable>
            )}
          </ScrollView>

          <View style={styles.actionRow}>
            <ClayButton
              label={saving ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              loading={saving}
              style={styles.saveBtn}
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
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  centerBox: { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  errorCard: { padding: Spacing.lg, alignItems: 'center', width: '100%' },
  errorEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: Spacing.xs },
  statusCard: { marginBottom: Spacing.md, padding: Spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rejectedBanner: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  card: { padding: Spacing.md },
  fieldLabel: { color: Colors.text, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  chipsRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: FontSize.caption, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: FontWeight.bold },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  imagesRow: { flexDirection: 'row', marginTop: Spacing.xs, marginBottom: Spacing.md },
  imageWrapper: { position: 'relative', marginRight: Spacing.sm },
  thumbnail: { width: 72, height: 72, borderRadius: Radius.md },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgeText: { color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold },
  addPhotoSlot: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.mint,
  },
  addPhotoIcon: { fontSize: 20 },
  addPhotoText: { fontSize: 9, color: Colors.text, marginTop: 2, fontWeight: FontWeight.bold },
  actionRow: { marginTop: Spacing.md, gap: Spacing.sm },
  saveBtn: { width: '100%' },
  cancelBtn: { width: '100%' },
  inlineError: {
    backgroundColor: Colors.peach,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  inlineErrorText: { color: Colors.error, fontSize: FontSize.caption },
});
