// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur.');
      return;
    }
    if (!isLogin && !name) {
      Alert.alert('Hata', 'Ad Soyad zorunludur.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simüle edilmiş giriş (gerçekte Supabase kullanılacak)
    setTimeout(() => {
      setUser(
        {
          id: '1',
          email,
          name: name || email.split('@')[0],
          phone,
          createdAt: new Date().toISOString(),
        },
        'mock-token-123'
      );
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏺</Text>
            </View>
            <Text style={styles.logoText}>züccaciye</Text>
            <Text style={styles.logoTagline}>Eviniz için her şey</Text>
          </View>

          {/* Tab geçişi */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad Soyad</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adınızı girin"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="05xx xxx xx xx"
                    placeholderTextColor={Colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPass}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnLoading]}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading
                  ? 'Lütfen bekleyin...'
                  : isLogin
                  ? 'Giriş Yap'
                  : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            {/* Sosyal giriş */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialIcon}>🌐</Text>
              <Text style={styles.socialText}>Google ile devam et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>Apple ile devam et</Text>
            </TouchableOpacity>
          </View>

          {/* Alt metin */}
          <Text style={styles.termsText}>
            Devam ederek{' '}
            <Text style={styles.termsLink}>Kullanım Koşulları</Text>
            {' '}ve{' '}
            <Text style={styles.termsLink}>Gizlilik Politikası</Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  scroll: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing['2xl'] },

  // Logo
  logoSection: { alignItems: 'center', paddingTop: Spacing['2xl'], paddingBottom: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  logoText: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.primary,
    fontFamily: Typography.fontFamily.display,
    letterSpacing: -0.5,
  },
  logoTagline: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginTop: 4 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: BorderRadius.full },
  tabActive: { backgroundColor: Colors.white, ...Shadows.sm },
  tabText: { fontSize: Typography.fontSize.base, color: Colors.textMuted, fontFamily: Typography.fontFamily.medium },
  tabTextActive: { color: Colors.primary, fontFamily: Typography.fontFamily.bold },

  // Form
  form: { gap: 0 },
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.white,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  showPass: { fontSize: 16, padding: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.md },
  forgotText: { fontSize: Typography.fontSize.sm, color: Colors.primary, fontFamily: Typography.fontFamily.medium },

  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  submitBtnLoading: { backgroundColor: Colors.primaryLight },
  submitBtnText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.bold },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: Colors.border },
  dividerText: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },

  // Social
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  socialIcon: { fontSize: 18 },
  socialText: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium },

  termsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.md,
  },
  termsLink: { color: Colors.primary, fontFamily: Typography.fontFamily.medium },
});
