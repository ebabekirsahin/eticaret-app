// src/screens/ProfileScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore, useFavoritesStore, useCartStore } from '@/store';

const MENU_ITEMS = [
  { icon: '📦', label: 'Siparişlerim', subtitle: 'Aktif ve geçmiş siparişler', route: '/profile/orders' },
  { icon: '📍', label: 'Adreslerim', subtitle: 'Kayıtlı teslimat adresleri', route: '/profile/addresses' },
  { icon: '♡', label: 'Favorilerim', subtitle: 'Beğendiğim ürünler', route: '/(tabs)/favorites' },
  { icon: '💳', label: 'Ödeme Yöntemlerim', subtitle: 'Kayıtlı kartlar', route: '/profile/payment' },
  { icon: '🔔', label: 'Bildirimler', subtitle: 'Kampanya ve sipariş bildirimleri', route: '/profile/notifications' },
  { icon: '🎁', label: 'Kuponlarım', subtitle: 'Aktif indirim kuponları', route: '/profile/coupons' },
  { icon: '⭐', label: 'Değerlendirmelerim', subtitle: 'Ürün yorumlarım', route: '/profile/reviews' },
  { icon: '❓', label: 'Yardım & Destek', subtitle: 'SSS ve iletişim', route: '/profile/help' },
  { icon: '⚙️', label: 'Ayarlar', subtitle: 'Hesap ve uygulama ayarları', route: '/profile/settings' },
];

// Örnek siparişler
const RECENT_ORDERS = [
  { id: 'SP001', date: '28 Mayıs 2025', total: '1.248 ₺', status: 'Teslim Edildi', statusColor: Colors.success },
  { id: 'SP002', date: '15 Mayıs 2025', total: '549 ₺', status: 'Kargoda', statusColor: Colors.info },
  { id: 'SP003', date: '2 Mayıs 2025', total: '2.890 ₺', status: 'Teslim Edildi', statusColor: Colors.success },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const favoriteCount = useFavoritesStore((s) => s.productIds.length);
  const cartCount = useCartStore((s) => s.getTotalItems());

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        },
      },
    ]);
  };

  // Giriş yapılmamışsa
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profilim</Text>
        </View>
        <View style={styles.guestContainer}>
          <Text style={styles.guestIcon}>👤</Text>
          <Text style={styles.guestTitle}>Hesabınıza giriş yapın</Text>
          <Text style={styles.guestSubtitle}>
            Siparişlerinizi takip etmek, favorilerinizi kaydetmek için giriş yapın
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login' as any)}
          >
            <Text style={styles.loginBtnText}>Giriş Yap / Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilim</Text>
        <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
          <Text style={styles.editBtn}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Kullanıcı kartı */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
          </View>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{RECENT_ORDERS.length}</Text>
            <Text style={styles.statLabel}>Sipariş</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cartCount}</Text>
            <Text style={styles.statLabel}>Sepette</Text>
          </View>
        </View>

        {/* Son siparişler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Siparişler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          {RECENT_ORDERS.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.8}>
              <View style={styles.orderLeft}>
                <Text style={styles.orderId}>#{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: order.statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menü */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                i < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Züccaciye v1.0.0</Text>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  editBtn: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  scroll: { paddingTop: Spacing.md },

  // Guest
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  guestIcon: { fontSize: 64, marginBottom: Spacing.sm },
  guestTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.medium,
  },
  statDivider: { width: 0.5, backgroundColor: Colors.border },

  // Orders
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: Typography.fontFamily.medium,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  orderLeft: { gap: 3 },
  orderId: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semiBold,
  },
  orderDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderTotal: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Menu
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  menuSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.error,
    marginBottom: Spacing.md,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    fontFamily: Typography.fontFamily.semiBold,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
});
