// mobile/app/(tabs)/sell.tsx
// Sell screen — Create product listing with real image picker, Cloudinary upload, and validation

import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { ClayHeader, ClayCard, ClayInput, ClayButton } from '@components/index';
import { Colors, Spacing, Radius, Typography, FontSize, FontWeight } from '@constants/theme';
import {
  createProduct,
  uploadProductImages,
  getAISuggestions,
  evaluateListingQuality,
  isMockEnabled,
} from '../../services/api';
import type { ProductCategory, ProductCondition } from '../../../shared/types';

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

export default function SellScreen() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('books');
  const [condition, setCondition] = useState<ProductCondition>('good');
  const [description, setDescription] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQualityScore, setAiQualityScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);

  // Pick images from the device gallery
  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow access to your photos to upload product pictures.',
        );
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

  const handleAIAssist = async () => {
    setAiLoading(true);
    try {
      const token = isMockEnabled() ? 'mock-token' : await getToken();
      if (!token) throw new Error('Please sign in to use the AI Listing Assistant.');

      const [suggestRes, evalRes] = await Promise.all([
        getAISuggestions(token, {
          draftTitle: title,
          draftDescription: description,
          category,
          price: parseFloat(price) || undefined,
        }),
        evaluateListingQuality(token, {
          draftTitle: title,
          draftDescription: description,
          category,
          price: parseFloat(price) || undefined,
        }),
      ]);

      if (suggestRes.title && !title) {
        setTitle(suggestRes.title);
      }
      if (suggestRes.description && (!description || description.length < 20)) {
        setDescription(suggestRes.description);
      }
      if (suggestRes.suggestedCategory) {
        setCategory(suggestRes.suggestedCategory);
      }

      setAiQualityScore(evalRes.qualityScore);
      setAiFeedback(evalRes.feedback || []);
      setAiTips([...(evalRes.improvements || []), ...(suggestRes.tips || [])]);

      Alert.alert(
        'AI Assistant Suggestions',
        `Listing Quality Score: ${evalRes.qualityScore}/100.\n\nSuggestions applied for title, description, and category. Review and edit as needed!`,
      );
    } catch (err) {
      Alert.alert(
        'AI Assistant',
        err instanceof Error ? err.message : 'Could not fetch AI suggestions.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
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

    setSubmitting(true);
    setStatusMessage('Preparing listing...');

    try {
      const token = isMockEnabled() ? 'mock-token' : await getToken();
      if (!token) {
        throw new Error('Please sign in to list items for sale.');
      }

      let uploadedImageUrls: string[] = [];

      // If user selected local images, upload them to Cloudinary via backend
      if (images.length > 0) {
        setStatusMessage(`Uploading ${images.length} image(s)...`);
        try {
          uploadedImageUrls = await uploadProductImages(token, images);
        } catch (uploadErr) {
          console.warn('[Image upload warning]', uploadErr);
          // If Cloudinary is unconfigured in local dev, allow listing without crashing
          uploadedImageUrls = [];
        }
      }

      setStatusMessage('Creating marketplace listing...');
      await createProduct(token, {
        title: title.trim(),
        price: numPrice,
        category,
        condition,
        description: description.trim() || undefined,
        campusLocation: campusLocation.trim() || undefined,
        images: uploadedImageUrls,
      });

      Alert.alert(
        'Listing Submitted 🎉',
        'Your listing has been submitted and is currently pending review. It will appear on the marketplace once approved by our verification team.',
        [
          {
            text: 'View in Dashboard',
            onPress: () => {
              // Reset form
              setTitle('');
              setPrice('');
              setDescription('');
              setCampusLocation('');
              setImages([]);
              router.push('/seller/dashboard');
            },
          },
        ],
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create listing.';
      setError(msg);
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ClayHeader title="Sell on Campus" subtitle="List a second-hand item" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <ClayCard variant="peach" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </ClayCard>
          )}

          {/* Item details */}
          <ClayCard>
            <Text style={[Typography.h3, styles.sectionTitle]}>Item Details</Text>

            <ClayInput
              label="Listing Title *"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (error) setError(null);
              }}
              placeholder="e.g. Calculus: Early Transcendentals 8th Ed"
              containerStyle={styles.field}
            />

            <ClayInput
              label="Price (₹) *"
              value={price}
              onChangeText={(p) => {
                setPrice(p);
                if (error) setError(null);
              }}
              placeholder="450"
              keyboardType="numeric"
              containerStyle={styles.field}
            />

            {/* Category selection */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>
              Category *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillScroll}
            >
              <View style={styles.pillRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <Pressable
                      key={cat.value}
                      onPress={() => setCategory(cat.value)}
                    >
                      <ClayCard
                        variant={isSelected ? 'mint' : 'default'}
                        style={[
                          styles.pill,
                          isSelected && styles.pillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            isSelected && { color: '#1A7A52' },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </ClayCard>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Condition selection */}
            <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>
              Condition *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillScroll}
            >
              <View style={styles.pillRow}>
                {CONDITIONS.map((cond) => {
                  const isSelected = condition === cond.value;
                  return (
                    <Pressable
                      key={cond.value}
                      onPress={() => setCondition(cond.value)}
                    >
                      <ClayCard
                        variant={isSelected ? 'mint' : 'default'}
                        style={[
                          styles.pill,
                          isSelected && styles.pillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            Typography.captionBold,
                            isSelected && { color: '#1A7A52' },
                          ]}
                        >
                          {cond.label}
                        </Text>
                      </ClayCard>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <ClayInput
              label="Preferred Meetup Location"
              value={campusLocation}
              onChangeText={setCampusLocation}
              placeholder="e.g. Central Library foyer, Student Center"
              containerStyle={styles.field}
            />

            <ClayInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Provide edition, working condition, or any included accessories..."
              multiline
              numberOfLines={4}
              containerStyle={styles.field}
              style={styles.multiline}
            />

            {/* AI Assistant Action */}
            <ClayButton
              label={aiLoading ? 'Generating AI Suggestions...' : '✨ AI Assist & Quality Check'}
              variant="secondary"
              onPress={handleAIAssist}
              loading={aiLoading}
              style={{ marginTop: Spacing.sm }}
            />

            {aiQualityScore !== null && (
              <ClayCard variant="mint" style={{ marginTop: Spacing.sm, padding: Spacing.sm }}>
                <Text style={Typography.bodyBold}>📊 Listing Score: {aiQualityScore}/100</Text>
                {aiFeedback.map((fb, idx) => (
                  <Text key={`fb-${idx}`} style={[Typography.caption, { color: '#1A7A52', marginTop: 2 }]}>
                    ✓ {fb}
                  </Text>
                ))}
                {aiTips.map((tip, idx) => (
                  <Text key={`tip-${idx}`} style={[Typography.caption, { color: Colors.textSecondary, marginTop: 2 }]}>
                    💡 {tip}
                  </Text>
                ))}
              </ClayCard>
            )}
          </ClayCard>

          {/* Image Picker Card */}
          <ClayCard>
            <View style={styles.imageHeader}>
              <Text style={Typography.h3}>Photos ({images.length}/5)</Text>
              {images.length < 5 && (
                <ClayButton
                  label="+ Add Photo"
                  variant="secondary"
                  onPress={handlePickImages}
                  style={styles.addPhotoBtn}
                />
              )}
            </View>

            {images.length === 0 ? (
              <Pressable onPress={handlePickImages} style={styles.uploadPrompt}>
                <Text style={styles.uploadEmoji}>📸</Text>
                <Text style={Typography.bodyBold}>Upload Item Photos</Text>
                <Text style={Typography.caption}>
                  Add up to 5 clear photos of your product.
                </Text>
              </Pressable>
            ) : (
              <View style={styles.thumbnailGrid}>
                {images.map((uri, idx) => (
                  <View key={uri} style={styles.thumbnailWrapper}>
                    <Image source={{ uri }} style={styles.thumbnail} />
                    <Pressable
                      onPress={() => handleRemoveImage(idx)}
                      style={styles.deletePhotoBtn}
                      hitSlop={8}
                    >
                      <Text style={styles.deletePhotoText}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ClayCard>

          {/* Verification Notice */}
          <ClayCard variant="lavender" style={styles.noticeCard}>
            <Text style={Typography.bodyBold}>🛡️ Verification Guarantee</Text>
            <Text style={[Typography.caption, { marginTop: 4 }]}>
              All campus listings are reviewed by verified student moderators to
              prevent spam, counterfeits, and prohibited items.
            </Text>
          </ClayCard>

          {statusMessage ? (
            <Text style={[Typography.caption, styles.statusMsg]}>
              {statusMessage}
            </Text>
          ) : null}

          <ClayButton
            label={submitting ? 'Submitting...' : 'Submit Listing'}
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: { marginBottom: Spacing.xs },
  field: { marginVertical: Spacing.xs },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: 4,
  },
  pillScroll: { marginVertical: 4 },
  pillRow: { flexDirection: 'row', gap: Spacing.xs, paddingVertical: 2 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    borderColor: '#1A7A52',
    borderWidth: 1.5,
  },
  multiline: { height: 90, textAlignVertical: 'top' },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addPhotoBtn: { minHeight: 34, paddingVertical: 6, paddingHorizontal: 12 },
  uploadPrompt: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 4,
  },
  uploadEmoji: { fontSize: 32 },
  thumbnailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  thumbnailWrapper: { position: 'relative' },
  thumbnail: { width: 72, height: 72, borderRadius: Radius.sm },
  deletePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePhotoText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  noticeCard: { padding: Spacing.base },
  errorCard: { padding: Spacing.md },
  errorText: { color: Colors.error, fontWeight: '600' },
  statusMsg: { textAlign: 'center', color: Colors.primary },
  submitBtn: { marginTop: Spacing.xs },
});
