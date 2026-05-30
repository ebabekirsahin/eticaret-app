// src/screens/CartScreen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useCartStore } from '@/store';
import { CartItem } from '@/types';

const { width } = Dimensions.get('window');
const CARGO_FREE_LIMIT = 500;

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const totalPrice = getTotalPrice();
  const cargoFee = totalPrice >= CARGO_FREE_LIMIT ? 0 : 39.90;
  const grandTotal = totalPrice + cargoFee;
  const remaining = CARGO_FREE_LIMIT - totalPrice;

  const handleRemove = useCallback((productId: string, name: string) => {
    Alert.alert(
      'Ürünü Kaldır',
      `"${name}" sepetten kaldırılsın mı?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeItem(productId);
          },
        },
      ]
    );
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Sepeti Temizle',
      'Tüm ürünler sepetten kaldırılsın mı?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearCart();
          },
        },
      ]
    );
  }, [clearCart]);

  // Boş sepet
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sepetim</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
          <Text style={styles.emptySubtitle}>
            Beğendiğiniz ürünleri sepete ekleyin
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopBtnText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Sepetim ({items.length} ürün)
        </Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearBtn}>Temizle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Ücretsiz kargo çubuğu */}
        {totalPrice < CARGO_FREE_LIMIT && (
          <View style={styles.cargoBar}>
            <Text style={styles.cargoBarText}>
              🚚 Ücretsiz kargo için{' '}
              <Text style={styles.cargoBarAmount}>
                {remaining.toFixed(2)} ₺
              </Text>{' '}
              daha ekle
            </Text>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((totalPrice / CARGO_FREE_LIMIT) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {totalPrice >= CARGO_FREE_LIMIT && (
          <View style={[styles.cargoBar, styles.cargoBarSuccess]}>
            <Text style={styles.cargoBarSuccessText}>
              🎉 Tebrikler! Ücretsiz kargo kazandınız!
            </Text>
          </View>
        )}

        {/* Ürünler */}
        <View style={styles.itemsSection}>
          {items.map((item) => (
            <CartItemCard
              key={item.product.id}
              item={item}
              onRemove={() => handleRemove(item.product.id, item.product.name)}
              onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
              onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
            />
          ))}
        </View>

        {/* Sipariş Özeti */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sipariş Özeti</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ürünler ({items.length})</Text>
            <Text style={styles.summaryValue}>
              {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kargo</Text>
            {cargoFee === 0 ? (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>ÜCRETSİZ</Text>
              </View>
            ) : (
              <Text style={styles.summaryValue}>
                {cargoFee.toFixed(2)} ₺
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>
              {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </Text>
          </View>
        </View>

        {/* Güven rozetleri */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🔒</Text>
            <Text style={styles.trustText}>Güvenli Ödeme</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>↩️</Text>
            <Text style={styles.trustText}>30 Gün İade</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>⭐</Text>
            <Text style={styles.trustText}>Orijinal Ürün</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Alt - Ödemeye Geç */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Toplam Tutar</Text>
          <Text style={styles.bottomTotalValue}>
            {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.checkoutBtnText}>Ödemeye Geç →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Cart Item Card ───────────────────────────────────────────────────────────

function CartItemCard({
  item,
  onRemove,
  onIncrease,
  onDecrease,
}: {
  item: CartItem;
  onRemove: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const { product, quantity } = item;

  return (
    <View style={styles.itemCard}>
      <TouchableOpacity
        onPress={() => router.push(`/product/${product.id}` as any)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: product.images[0] }}
          style={styles.itemImage}
          contentFit="cover"
        />
      </TouchableOpacity>

      <View style={styles.itemContent}>
        {product.brand && (
          <Text style={styles.itemBrand}>{product.brand}</Text>
        )}
        <Text style={styles.itemName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.itemPrice}>
          {product.price.toLocaleString('tr-TR')} ₺
        </Text>

        <View style={styles.itemBottom}>
          {/* Adet */}
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Satır toplamı */}
          <Text style={styles.itemTotal}>
            {(product.price * quantity).toLocaleString('tr-TR')} ₺
          </Text>
        </View>
      </View>

      {/* Sil */}
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  clearBtn: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    fontFamily: Typography.fontFamily.medium,
  },

  scroll: { paddingTop: Spacing.sm },

  // Kargo çubuğu
  cargoBar: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  cargoBarSuccess: { backgroundColor: '#EAF7EF' },
  cargoBarText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cargoBarAmount: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  progressBg: {
    height: 5,
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  cargoBarSuccessText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },

  // Items
  itemsSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  itemCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray100,
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingRight: Spacing.xl,
  },
  itemBrand: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    color: Colors.primary,
    lineHeight: 24,
  },
  qtyValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  removeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },

  // Summary
  summaryCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  freeBadge: {
    backgroundColor: '#EAF7EF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  freeBadgeText: {
    fontSize: 11,
    color: Colors.success,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },

  // Trust
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  trustItem: { alignItems: 'center', gap: 4 },
  trustIcon: { fontSize: 22 },
  trustText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    gap: Spacing.base,
    ...Shadows.lg,
  },
  bottomTotal: { gap: 2 },
  bottomTotalLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  bottomTotalValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.sm },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  shopBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  shopBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },
});
