// src/screens/FavoritesScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useFavoritesStore, useCartStore } from '@/store';
import { PRODUCTS } from '@/utils/mockData';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.screen * 2 - Spacing.md) / 2;

export default function FavoritesScreen() {
  const productIds = useFavoritesStore((s) => s.productIds);
  const toggle = useFavoritesStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  const favorites = PRODUCTS.filter((p) => productIds.includes(p.id));

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        {item.discountPercent && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>%{item.discountPercent}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggle(item.id);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.removeIcon}>♥</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{item.price.toLocaleString('tr-TR')} ₺</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                {item.originalPrice.toLocaleString('tr-TR')} ₺
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              addItem(item);
            }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorilerim</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Favori listeniz boş</Text>
          <Text style={styles.emptySubtitle}>
            Beğendiğiniz ürünleri favorilere ekleyin
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopBtnText}>Ürünleri Keşfet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Favorilerim ({favorites.length})
        </Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
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
  list: { padding: Spacing.screen, paddingBottom: Spacing['4xl'] },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageWrap: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontFamily: Typography.fontFamily.bold },
  removeBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  removeIcon: { fontSize: 15, color: Colors.primary },
  content: { padding: Spacing.sm + 2 },
  brand: {
    fontSize: Typography.fontSize.xs, color: Colors.textMuted,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2,
  },
  name: {
    fontSize: Typography.fontSize.sm, color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium, lineHeight: 18, marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  star: { color: Colors.accent, fontSize: 12, marginRight: 2 },
  rating: { fontSize: Typography.fontSize.xs, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold, marginRight: 2 },
  reviewCount: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: Typography.fontSize.base, color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  originalPrice: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: Colors.white, fontSize: 20, lineHeight: 26 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 64, color: Colors.gray200, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Typography.fontSize.xl, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },
  emptySubtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing['2xl'] },
  shopBtn: {
    marginTop: Spacing.md, backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  shopBtnText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.bold },
});
