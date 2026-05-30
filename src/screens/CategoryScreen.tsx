// src/screens/CategoryScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PRODUCTS, CATEGORIES } from '@/utils/mockData';
import { useCartStore, useFavoritesStore } from '@/store';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - Spacing.screen * 2 - Spacing.md) / 2;

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const category = CATEGORIES.find((c) => c.id === id);

  const products = useMemo(() => {
    if (!category) return [];
    let result = PRODUCTS.filter((p) => p.category === category.name);
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [category, sortBy]);

  const SORT_OPTIONS = [
    { label: 'Önerilen', value: 'relevance' as SortOption },
    { label: 'En Ucuz', value: 'price_asc' as SortOption },
    { label: 'En Pahalı', value: 'price_desc' as SortOption },
    { label: 'En Yüksek Puan', value: 'rating' as SortOption },
  ];

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
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{item.discountPercent}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggle(item.id);
          }}
        >
          <Text style={[styles.heart, isFavorite(item.id) && styles.heartActive]}>
            {isFavorite(item.id) ? '♥' : '♡'}
          </Text>
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.categoryEmoji}>{category?.icon}</Text>
          <Text style={styles.headerTitle}>{category?.name ?? 'Kategori'}</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/search' as any)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>{products.length} ürün</Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Text style={styles.sortIcon}>⇅</Text>
          <Text style={styles.sortLabel}>
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sortMenuItem}
              onPress={() => { setSortBy(opt.value); setShowSortMenu(false); }}
            >
              <Text style={[styles.sortMenuText, sortBy === opt.value && styles.sortMenuTextActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={products}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  categoryEmoji: { fontSize: 20 },
  headerTitle: { fontSize: Typography.fontSize.lg, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },
  searchBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchIcon: { fontSize: 18 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  resultCount: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  sortIcon: { fontSize: 14, color: Colors.textSecondary },
  sortLabel: { fontSize: Typography.fontSize.xs, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium },
  sortMenu: { position: 'absolute', top: 120, right: Spacing.screen, backgroundColor: Colors.white, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, zIndex: 100, ...Shadows.md, minWidth: 160 },
  sortMenuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm + 2, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  sortMenuText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  sortMenuTextActive: { color: Colors.primary, fontFamily: Typography.fontFamily.semiBold },
  check: { fontSize: 14, color: Colors.primary },
  list: { padding: Spacing.screen, paddingBottom: Spacing['4xl'] },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: { width: GRID_ITEM_WIDTH, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.sm },
  imageWrap: { width: '100%', height: GRID_ITEM_WIDTH * 1.1, backgroundColor: Colors.gray100, position: 'relative' },
  image: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.primary, borderRadius: BorderRadius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: Colors.white, fontSize: 10, fontFamily: Typography.fontFamily.bold },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  heart: { fontSize: 15, color: Colors.gray400 },
  heartActive: { color: Colors.primary },
  content: { padding: Spacing.sm + 2 },
  brand: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, fontFamily: Typography.fontFamily.medium, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  name: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium, lineHeight: 18, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  star: { color: Colors.accent, fontSize: 12, marginRight: 2 },
  rating: { fontSize: Typography.fontSize.xs, color: Colors.textPrimary, fontFamily: Typography.fontFamily.semiBold, marginRight: 2 },
  reviewCount: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: Typography.fontSize.base, color: Colors.primary, fontFamily: Typography.fontFamily.bold },
  originalPrice: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: Colors.white, fontSize: 20, lineHeight: 26 },
});
