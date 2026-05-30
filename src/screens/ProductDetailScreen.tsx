// src/screens/ProductDetailScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PRODUCTS } from '@/utils/mockData';
import { useCartStore, useFavoritesStore } from '@/store';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 1.05;

// Örnek yorumlar
const REVIEWS = [
  { id: '1', name: 'Ayşe K.', avatar: '👩', rating: 5, date: '12 Mart 2025', comment: 'Çok kaliteli ürün, fotoğraftaki gibi geldi. Kesinlikle tavsiye ederim!' },
  { id: '2', name: 'Mehmet Y.', avatar: '👨', rating: 4, date: '5 Şubat 2025', comment: 'Güzel ürün, kargo hızlıydı. Beklentilerimi karşıladı.' },
  { id: '3', name: 'Fatma S.', avatar: '👩', rating: 5, date: '20 Ocak 2025', comment: 'Hediye aldım, çok beğendiler. Paketleme de çok şıktı.' },
];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const product = PRODUCTS.find((p) => p.id === id);
  const similarProducts = PRODUCTS.filter(
    (p) => p.category === product?.category && p.id !== id
  ).slice(0, 4);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Ürün bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.goBack}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity, addItem]);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(product.id);
  }, [product.id, toggle]);

  const favorite = isFavorite(product.id);

  const savings = product.originalPrice
    ? product.originalPrice - product.price
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Fotoğraf Galerisi */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImage(idx);
            }}
          >
            {product.images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img }}
                style={styles.galleryImage}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>

          {/* Gradient üst */}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent']}
            style={styles.topGradient}
          />

          {/* Geri butonu */}
          <SafeAreaView style={styles.galleryHeader} edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Text style={styles.shareIcon}>⬆</Text>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Foto dots */}
          {product.images.length > 1 && (
            <View style={styles.imageDots}>
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Favori butonu */}
          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite}>
            <Text style={[styles.favIcon, favorite && styles.favIconActive]}>
              {favorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ürün Bilgileri */}
        <View style={styles.content}>

          {/* Üst bilgi */}
          <View style={styles.topInfo}>
            <View style={styles.badgeRow}>
              {product.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>YENİ</Text>
                </View>
              )}
              {product.brand && (
                <Text style={styles.brand}>{product.brand}</Text>
              )}
            </View>
            <Text style={styles.productName}>{product.name}</Text>

            {/* Puan */}
            <TouchableOpacity style={styles.ratingRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text
                    key={s}
                    style={[
                      styles.starIcon,
                      s <= Math.round(product.rating)
                        ? styles.starFilled
                        : styles.starEmpty,
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text style={styles.ratingValue}>{product.rating}</Text>
              <Text style={styles.reviewCount}>
                ({product.reviewCount} değerlendirme)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Fiyat */}
          <View style={styles.priceSection}>
            <View style={styles.priceLeft}>
              <Text style={styles.price}>
                {product.price.toLocaleString('tr-TR')} ₺
              </Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>
                  {product.originalPrice.toLocaleString('tr-TR')} ₺
                </Text>
              )}
            </View>
            {savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  {savings.toLocaleString('tr-TR')} ₺ tasarruf
                </Text>
              </View>
            )}
          </View>

          {/* Stok durumu */}
          <View style={styles.stockRow}>
            <View style={[
              styles.stockDot,
              { backgroundColor: product.stock > 10 ? Colors.success : Colors.warning }
            ]} />
            <Text style={styles.stockText}>
              {product.stock > 10
                ? 'Stokta var'
                : `Son ${product.stock} ürün!`}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Miktar seçimi */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Adet</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Açıklama */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Etiketler */}
          {product.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {product.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Kargo bilgisi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kargo & Teslimat</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🚚</Text>
              <View>
                <Text style={styles.infoLabel}>Ücretsiz Kargo</Text>
                <Text style={styles.infoValue}>150 ₺ ve üzeri siparişlerde</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📦</Text>
              <View>
                <Text style={styles.infoLabel}>Tahmini Teslimat</Text>
                <Text style={styles.infoValue}>2-4 iş günü</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>↩️</Text>
              <View>
                <Text style={styles.infoLabel}>Kolay İade</Text>
                <Text style={styles.infoValue}>30 gün içinde ücretsiz iade</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Yorumlar */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingValue}>{product.rating}</Text>
                <Text style={styles.overallRatingStar}>★</Text>
              </View>
            </View>

            {REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarEmoji}>{review.avatar}</Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Text
                        key={s}
                        style={[
                          styles.reviewStar,
                          s <= review.rating ? styles.starFilled : styles.starEmpty,
                        ]}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Benzer Ürünler */}
          {similarProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benzer Ürünler</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarList}
              >
                {similarProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.similarCard}
                    onPress={() => router.push(`/product/${p.id}` as any)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: p.images[0] }}
                      style={styles.similarImage}
                      contentFit="cover"
                    />
                    <Text style={styles.similarName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={styles.similarPrice}>
                      {p.price.toLocaleString('tr-TR')} ₺
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Alt - Sepete Ekle */}
      <View style={styles.bottomBar}>
        <View style={styles.totalPrice}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalValue}>
            {(product.price * quantity).toLocaleString('tr-TR')} ₺
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, addedToCart && styles.addedBtn]}
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <Text style={styles.addToCartText}>
            {addedToCart ? '✓ Sepete Eklendi' : '🛒 Sepete Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: Typography.fontSize.lg, color: Colors.textPrimary },
  goBack: { fontSize: Typography.fontSize.base, color: Colors.primary },

  // Gallery
  gallery: { width, height: IMAGE_HEIGHT, position: 'relative' },
  galleryImage: { width, height: IMAGE_HEIGHT },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  galleryHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: Colors.white },
  shareBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: { fontSize: 16, color: Colors.white },
  imageDots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: Colors.white, width: 18 },
  favBtn: {
    position: 'absolute', bottom: 16, right: Spacing.screen,
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  favIcon: { fontSize: 20, color: Colors.gray400 },
  favIconActive: { color: Colors.primary },

  // Content
  content: { backgroundColor: Colors.white },
  topInfo: { padding: Spacing.base },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  newBadge: { backgroundColor: Colors.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.xs },
  newBadgeText: { color: Colors.white, fontSize: 10, fontFamily: Typography.fontFamily.bold, letterSpacing: 0.5 },
  brand: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, fontFamily: Typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.8 },
  productName: { fontSize: Typography.fontSize['2xl'], color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, lineHeight: 30, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starsRow: { flexDirection: 'row' },
  starIcon: { fontSize: 15 },
  starFilled: { color: Colors.accent },
  starEmpty: { color: Colors.gray200 },
  ratingValue: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },
  reviewCount: { fontSize: Typography.fontSize.sm, color: Colors.primary, textDecorationLine: 'underline' },

  divider: { height: 8, backgroundColor: Colors.background },

  // Price
  priceSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
  },
  priceLeft: { gap: 2 },
  price: { fontSize: Typography.fontSize['3xl'], color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  originalPrice: { fontSize: Typography.fontSize.base, color: Colors.textMuted, textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  savingsText: { fontSize: Typography.fontSize.sm, color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  // Quantity
  quantitySection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
  },
  sectionLabel: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, color: Colors.primary, lineHeight: 24 },
  qtyValue: { fontSize: Typography.fontSize.xl, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, minWidth: 30, textAlign: 'center' },

  // Sections
  section: { padding: Spacing.base },
  sectionTitle: { fontSize: Typography.fontSize.lg, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, marginBottom: Spacing.md },
  description: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  tag: { backgroundColor: Colors.gray100, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  tagText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoLabel: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold },
  infoValue: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },

  // Reviews
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  overallRating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm },
  overallRatingValue: { fontSize: Typography.fontSize.base, color: Colors.white, fontFamily: Typography.fontFamily.bold },
  overallRatingStar: { fontSize: 14, color: Colors.white },
  reviewCard: { backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  reviewAvatarEmoji: { fontSize: 18 },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold },
  reviewDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  reviewStars: { flexDirection: 'row' },
  reviewStar: { fontSize: 13 },
  reviewComment: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Similar
  similarList: { gap: Spacing.md, paddingRight: Spacing.base },
  similarCard: { width: 130, backgroundColor: Colors.white, borderRadius: BorderRadius.md, overflow: 'hidden', ...Shadows.sm },
  similarImage: { width: 130, height: 130 },
  similarName: { fontSize: Typography.fontSize.xs, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium, padding: 8, lineHeight: 16 },
  similarPrice: { fontSize: Typography.fontSize.sm, color: Colors.primary, fontFamily: Typography.fontFamily.bold, paddingHorizontal: 8, paddingBottom: 8 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    gap: Spacing.base,
    ...Shadows.lg,
  },
  totalPrice: { gap: 2 },
  totalLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  totalValue: { fontSize: Typography.fontSize.xl, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },
  addToCartBtn: {
    flex: 1, backgroundColor: Colors.primary,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  addedBtn: { backgroundColor: Colors.success },
  addToCartText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.bold },
});
