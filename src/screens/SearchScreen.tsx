// src/screens/SearchScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { PRODUCTS, CATEGORIES } from '@/utils/mockData';
import { useCartStore, useFavoritesStore } from '@/store';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - Spacing.screen * 2 - Spacing.md) / 2;

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Önerilen', value: 'relevance' },
  { label: 'En Ucuz', value: 'price_asc' },
  { label: 'En Pahalı', value: 'price_desc' },
  { label: 'En Yüksek Puan', value: 'rating' },
  { label: 'En Yeni', value: 'newest' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Arama filtresi
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Kategori filtresi
    if (selectedCategory) {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat) {
        result = result.filter((p) => p.category === cat.name);
      }
    }

    // Sıralama
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [query, selectedCategory, sortBy]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addItem(product);
    },
    [addItem]
  );

  const handleFavorite = useCallback(
    (productId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggle(productId);
    },
    [toggle]
  );

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Önerilen';

  const renderGridItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.92}
    >
      <View style={styles.gridImageWrap}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.gridImage}
          contentFit="cover"
          transition={200}
        />
        {item.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{item.discountPercent}</Text>
          </View>
        )}
        {item.isNew && !item.discountPercent && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>YENİ</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => handleFavorite(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heart, isFavorite(item.id) && styles.heartActive]}>
            {isFavorite(item.id) ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.gridContent}>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        <Text style={styles.gridName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
        <View style={styles.gridPriceRow}>
          <View>
            <Text style={styles.price}>
              {item.price.toLocaleString('tr-TR')} ₺
            </Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                {item.originalPrice.toLocaleString('tr-TR')} ₺
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
      activeOpacity={0.92}
    >
      <View style={styles.listImageWrap}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.listImage}
          contentFit="cover"
          transition={200}
        />
        {item.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>%{item.discountPercent}</Text>
          </View>
        )}
      </View>
      <View style={styles.listContent}>
        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        <Text style={styles.listName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount})</Text>
        </View>
        <View style={styles.listBottom}>
          <View>
            <Text style={styles.price}>
              {item.price.toLocaleString('tr-TR')} ₺
            </Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                {item.originalPrice.toLocaleString('tr-TR')} ₺
              </Text>
            )}
          </View>
          <View style={styles.listActions}>
            <TouchableOpacity
              onPress={() => handleFavorite(item.id)}
              style={styles.listFavBtn}
            >
              <Text style={[styles.heart, isFavorite(item.id) && styles.heartActive]}>
                {isFavorite(item.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtnList}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addBtnListText}>Sepete Ekle</Text>
            </TouchableOpacity>
          </View>
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
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün, kategori veya marka ara..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Kategoriler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
            }
          >
            <Text style={styles.categoryChipEmoji}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Araç çubuğu */}
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>
          {filteredProducts.length} ürün bulundu
        </Text>
        <View style={styles.toolbarActions}>
          {/* Sıralama */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={styles.sortIcon}>⇅</Text>
            <Text style={styles.sortLabel}>{currentSortLabel}</Text>
          </TouchableOpacity>
          {/* Görünüm */}
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewIcon}>
              {viewMode === 'grid' ? '▤' : '⊞'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sıralama Menüsü */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.sortMenuItem}
              onPress={() => {
                setSortBy(opt.value);
                setShowSortMenu(false);
              }}
            >
              <Text
                style={[
                  styles.sortMenuText,
                  sortBy === opt.value && styles.sortMenuTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {sortBy === opt.value && (
                <Text style={styles.sortMenuCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ürünler */}
      {filteredProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            Farklı bir arama terimi veya kategori deneyin
          </Text>
        </View>
      ) : viewMode === 'grid' ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.xs,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.regular,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 13,
    color: Colors.textMuted,
    padding: 4,
  },
  // Kategoriler
  categoriesScroll: {
    backgroundColor: Colors.white,
    maxHeight: 52,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipEmoji: {
    fontSize: 13,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  // Toolbar
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
  resultCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortIcon: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  viewBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  // Sort menu
  sortMenu: {
    position: 'absolute',
    top: 160,
    right: Spacing.screen,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    ...Shadows.md,
    minWidth: 160,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sortMenuText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  sortMenuTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  sortMenuCheck: {
    fontSize: 14,
    color: Colors.primary,
  },
  // Grid
  gridContainer: {
    padding: Spacing.screen,
    paddingBottom: Spacing['4xl'],
  },
  gridRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridCard: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  gridImageWrap: {
    width: '100%',
    height: GRID_ITEM_WIDTH * 1.1,
    backgroundColor: Colors.gray100,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridContent: {
    padding: Spacing.sm + 2,
  },
  gridName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 18,
    marginBottom: 4,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  // List
  listContainer: {
    padding: Spacing.screen,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.sm,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  listImageWrap: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  listBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listFavBtn: {
    padding: 4,
  },
  addBtnList: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  addBtnListText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  // Shared
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  heart: {
    fontSize: 15,
    color: Colors.gray400,
  },
  heartActive: {
    color: Colors.primary,
  },
  brand: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  star: {
    color: Colors.accent,
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
    marginRight: 2,
  },
  reviewCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  price: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  originalPrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 20,
    lineHeight: 26,
  },
  // Empty
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
});
