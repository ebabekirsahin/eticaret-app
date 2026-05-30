// src/screens/CheckoutScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useCartStore } from '@/store';

type PaymentMethod = 'card' | 'transfer' | 'cash';

const CARGO_FREE_LIMIT = 500;

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalPrice = getTotalPrice();
  const cargoFee = totalPrice >= CARGO_FREE_LIMIT ? 0 : 39.90;
  const grandTotal = totalPrice + cargoFee;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    city: '',
    district: '',
    fullAddress: '',
  });
  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const handleOrder = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🎉 Siparişiniz Alındı!',
      'Siparişiniz başarıyla oluşturuldu. Takip numaranız e-posta ile gönderildi.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            clearCart();
            router.replace('/');
          },
        },
      ]
    );
  };

  const steps = ['Adres', 'Ödeme', 'Özet'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Adım göstergesi */}
      <View style={styles.stepper}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                step > i + 1 && styles.stepDone,
                step === i + 1 && styles.stepActive,
              ]}>
                {step > i + 1 ? (
                  <Text style={styles.stepDoneIcon}>✓</Text>
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    step === i + 1 && styles.stepNumberActive,
                  ]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                step === i + 1 && styles.stepLabelActive,
              ]}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, step > i + 1 && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ADIM 1: Adres */}
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teslimat Adresi</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                placeholder="Adınızı girin"
                placeholderTextColor={Colors.textMuted}
                value={address.fullName}
                onChangeText={(v) => setAddress({ ...address, fullName: v })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefon</Text>
              <TextInput
                style={styles.input}
                placeholder="05xx xxx xx xx"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={address.phone}
                onChangeText={(v) => setAddress({ ...address, phone: v })}
              />
            </View>

            <View style={styles.row2}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>İl</Text>
                <TextInput
                  style={styles.input}
                  placeholder="İstanbul"
                  placeholderTextColor={Colors.textMuted}
                  value={address.city}
                  onChangeText={(v) => setAddress({ ...address, city: v })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>İlçe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kadıköy"
                  placeholderTextColor={Colors.textMuted}
                  value={address.district}
                  onChangeText={(v) => setAddress({ ...address, district: v })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açık Adres</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Mahalle, sokak, bina no, daire no..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={address.fullAddress}
                onChangeText={(v) => setAddress({ ...address, fullAddress: v })}
              />
            </View>
          </View>
        )}

        {/* ADIM 2: Ödeme */}
        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>

            {/* Ödeme seçenekleri */}
            {[
              { key: 'card', icon: '💳', label: 'Kredi / Banka Kartı' },
              { key: 'transfer', icon: '🏦', label: 'Havale / EFT' },
              { key: 'cash', icon: '💵', label: 'Kapıda Ödeme' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.paymentOption,
                  paymentMethod === opt.key && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod(opt.key as PaymentMethod)}
              >
                <Text style={styles.paymentIcon}>{opt.icon}</Text>
                <Text style={[
                  styles.paymentLabel,
                  paymentMethod === opt.key && styles.paymentLabelActive,
                ]}>{opt.label}</Text>
                <View style={[
                  styles.radio,
                  paymentMethod === opt.key && styles.radioActive,
                ]}>
                  {paymentMethod === opt.key && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Kart bilgileri */}
            {paymentMethod === 'card' && (
              <View style={styles.cardForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kart Numarası</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    maxLength={19}
                    value={card.number}
                    onChangeText={(v) => setCard({ ...card, number: v })}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kart Üzerindeki İsim</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="AD SOYAD"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    value={card.name}
                    onChangeText={(v) => setCard({ ...card, name: v })}
                  />
                </View>
                <View style={styles.row2}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Son Kul. Tarihi</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="AA/YY"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      maxLength={5}
                      value={card.expiry}
                      onChangeText={(v) => setCard({ ...card, expiry: v })}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="***"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                      value={card.cvv}
                      onChangeText={(v) => setCard({ ...card, cvv: v })}
                    />
                  </View>
                </View>
                <View style={styles.sslRow}>
                  <Text style={styles.sslIcon}>🔒</Text>
                  <Text style={styles.sslText}>256-bit SSL şifreleme ile güvenli ödeme</Text>
                </View>
              </View>
            )}

            {paymentMethod === 'transfer' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Havale / EFT Bilgileri</Text>
                <Text style={styles.infoBoxText}>Banka: Türkiye İş Bankası</Text>
                <Text style={styles.infoBoxText}>IBAN: TR00 0006 4000 0012 3456 7890 00</Text>
                <Text style={styles.infoBoxText}>Hesap Adı: Züccaciye Tic. A.Ş.</Text>
                <Text style={styles.infoBoxNote}>
                  * Havale/EFT sonrası siparişiniz onaylanacaktır.
                </Text>
              </View>
            )}

            {paymentMethod === 'cash' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Kapıda Ödeme</Text>
                <Text style={styles.infoBoxText}>
                  Nakit veya kredi kartıyla kapıda ödeme yapabilirsiniz.
                </Text>
                <Text style={styles.infoBoxNote}>
                  * Kapıda ödeme için +10 ₺ hizmet bedeli uygulanır.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ADIM 3: Özet */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sipariş Özeti</Text>

            {/* Adres özet */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBlockTitle}>📍 Teslimat Adresi</Text>
              <Text style={styles.summaryBlockText}>{address.fullName}</Text>
              <Text style={styles.summaryBlockText}>{address.phone}</Text>
              <Text style={styles.summaryBlockText}>
                {address.district}, {address.city}
              </Text>
              <Text style={styles.summaryBlockText}>{address.fullAddress}</Text>
            </View>

            {/* Ödeme özet */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBlockTitle}>💳 Ödeme Yöntemi</Text>
              <Text style={styles.summaryBlockText}>
                {paymentMethod === 'card' && `Kredi Kartı (**** ${card.number.slice(-4) || '****'})`}
                {paymentMethod === 'transfer' && 'Havale / EFT'}
                {paymentMethod === 'cash' && 'Kapıda Ödeme'}
              </Text>
            </View>

            {/* Ürünler özet */}
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryBlockTitle}>📦 Ürünler ({items.length})</Text>
              {items.map((item) => (
                <View key={item.product.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={1}>
                    {item.quantity}x {item.product.name}
                  </Text>
                  <Text style={styles.orderItemPrice}>
                    {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                  </Text>
                </View>
              ))}
            </View>

            {/* Toplam */}
            <View style={styles.totalBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Ürünler</Text>
                <Text style={styles.totalRowValue}>
                  {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Kargo</Text>
                <Text style={[styles.totalRowValue, cargoFee === 0 && { color: Colors.success }]}>
                  {cargoFee === 0 ? 'Ücretsiz' : `${cargoFee.toFixed(2)} ₺`}
                </Text>
              </View>
              {paymentMethod === 'cash' && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalRowLabel}>Kapıda Ödeme</Text>
                  <Text style={styles.totalRowValue}>10.00 ₺</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
                <Text style={styles.grandTotalValue}>
                  {(grandTotal + (paymentMethod === 'cash' ? 10 : 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Alt buton */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          >
            <Text style={styles.prevBtnText}>← Geri</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            if (step < 3) {
              setStep((s) => (s + 1) as 1 | 2 | 3);
            } else {
              handleOrder();
            }
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.nextBtnText}>
            {step === 3 ? '✓ Siparişi Tamamla' : 'Devam Et →'}
          </Text>
        </TouchableOpacity>
      </View>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: { fontSize: Typography.fontSize.xl, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.screen,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { borderColor: Colors.primary },
  stepDone: { borderColor: Colors.success, backgroundColor: Colors.success },
  stepNumber: { fontSize: 13, color: Colors.textMuted, fontFamily: Typography.fontFamily.bold },
  stepNumberActive: { color: Colors.primary },
  stepDoneIcon: { fontSize: 14, color: Colors.white },
  stepLabel: { fontSize: 11, color: Colors.textMuted },
  stepLabelActive: { color: Colors.primary, fontFamily: Typography.fontFamily.semiBold },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray200, marginHorizontal: 6, marginBottom: 16 },
  stepLineDone: { backgroundColor: Colors.success },

  scroll: { paddingTop: Spacing.md },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.screen,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.base,
  },

  // Form
  inputGroup: { marginBottom: Spacing.md },
  inputLabel: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    fontSize: Typography.fontSize.base, color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  textarea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.sm },
  row2: { flexDirection: 'row', gap: Spacing.md },

  // Payment
  paymentOption: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, gap: Spacing.md,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  paymentIcon: { fontSize: 22 },
  paymentLabel: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  paymentLabelActive: { color: Colors.primary, fontFamily: Typography.fontFamily.semiBold },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.gray200, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  cardForm: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.border },
  sslRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sslIcon: { fontSize: 14 },
  sslText: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },

  infoBox: { backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.md, gap: 4 },
  infoBoxTitle: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, marginBottom: 4 },
  infoBoxText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  infoBoxNote: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: 4, fontStyle: 'italic' },

  // Summary
  summaryBlock: { backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: 3 },
  summaryBlockTitle: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold, marginBottom: 6 },
  summaryBlockText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  orderItemName: { flex: 1, fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  orderItemPrice: { fontSize: Typography.fontSize.sm, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium },
  totalBlock: { borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: Spacing.md, gap: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRowLabel: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  totalRowValue: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontFamily: Typography.fontFamily.medium },
  grandTotalRow: { borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 },
  grandTotalLabel: { fontSize: Typography.fontSize.lg, color: Colors.textPrimary, fontFamily: Typography.fontFamily.bold },
  grandTotalValue: { fontSize: Typography.fontSize.xl, color: Colors.primary, fontFamily: Typography.fontFamily.bold },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  prevBtn: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border,
  },
  prevBtnText: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium },
  nextBtn: {
    flex: 1, backgroundColor: Colors.primary,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  nextBtnText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.bold },
});
