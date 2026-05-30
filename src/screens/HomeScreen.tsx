// src/screens/HomeScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  StatusBar,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useCartStore } from '@/store';
import { ProductCard } from '@/components/ProductCard';
import { BANNERS, CATEGORIES, PRODUCTS } from '@/utils/mockData';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 200;

export default function HomeScreen() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchText, setSearchText] = useState('');
  const bannerRef = useRef<ScrollView>(null);
  const totalItems = useCartStore((s) => s.getTotalItems());

  // Auto-scroll banners
  React.useEffect(() => {
    const interval = setInterval(() => {
      const next = (activeBanner + 1) % BANNERS.length;
      bannerRef.current?.scrollTo({ x: next * width, animated: true });
      setActiveBanner(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeBanner]);

  const handleBannerScroll = useCallback((e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveBanner(idx);
  }, []);

  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured);
  const newProducts = PRODUCTS.filter((p) => p.isNew);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>züccaciye</Text>
          <Text style={styles.tagline}>Eviniz için her şey</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search')}
          activeOpacity={0.85}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Ürün, kategori veya marka ara...</Text>
        </TouchableOpacity>

        {/* ── Banner Slider ── */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
          >
            {BANNERS.map((banner) => (
              <TouchableOpacity
                key={banner.id}
                activeOpacity={0.95}
                onPress={() => router.push(banner.ctaLink as any)}
              >
                <View style={[styles.banner, { width }]}>
                  <Image
                    source={{ uri: banner.image }}
                    style={styles.bannerImage}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.65)']}
                    style={styles.bannerGradient}
                  />
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    {banner.subtitle && (
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    )}
                    <View style={styles.bannerCTA}>
                      <Text style={styles.bannerCTAText}>{banner.ctaText} →</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeBanner && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => router.push(`/category/${cat.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '18' }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Flash Sale Banner ── */}
        <TouchableOpacity style={styles.flashSale} activeOpacity={0.9}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.flashGradient}
          >
            <View>
              <Text style={styles.flashTitle}>⚡ Flaş Fırsat</Text>
              <Text style={styles.flashSubtitle}>Bugüne özel seçili ürünlerde</Text>
              <Text style={styles.flashDiscount}>%50'ye varan indirim</Text>
            </View>
            <View style={styles.flashTimer}>
              <Text style={styles.flashTimerLabel}>Biter:</Text>
              <Text style={styles.flashTimerValue}>08:42:17</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Featured Products ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: Spacing.screen, gap: Spacing.md }}
          >
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollView>
        </View>

        {/* ── New Arrivals ── */}
        {newProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Yeni Gelenler <Text style={styles.newTag}>YENİ</Text>
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: Spacing.screen, gap: Spacing.md }}
            >
              {newProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── All Products Grid ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tüm Ürünler</Text>
          </View>
          <View style={styles.productsGrid}>
            {PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.display,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cartBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
  },
  scroll: {
    paddingTop: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.regular,
  },
  // Banner
  bannerContainer: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  banner: {
    height: BANNER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT * 0.7,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.white,
    fontFamily: Typography.fontFamily.display,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  bannerCTA: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  bannerCTAText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray200,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 18,
  },
  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  seeAll: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  newTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  // Categories
  categoriesRow: {
    paddingLeft: Spacing.screen,
    paddingRight: Spacing.base,
    gap: Spacing.base,
  },
  categoryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  // Flash Sale
  flashSale: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  flashGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base + 4,
  },
  flashTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  flashSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  flashDiscount: {
    fontSize: Typography.fontSize.xl,
    color: Colors.accentLight,
    fontFamily: Typography.fontFamily.display,
  },
  flashTimer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  flashTimerLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  flashTimerValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
  },
  // Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.md,
  },
});
