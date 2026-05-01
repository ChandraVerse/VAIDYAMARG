import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const { sendOtp, isLoading } = useAuthStore();

  const isValid = /^[6-9]\d{9}$/.test(phone);

  const handleSend = async () => {
    if (!isValid) return;
    try {
      await sendOtp(`+91${phone}`);
      router.push({ pathname: '/(auth)/otp', params: { phone: `+91${phone}` } });
    } catch {
      Toast.show({
        type:  'error',
        text1: 'Could not send OTP',
        text2: 'Please check your number and try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.heading}>Enter your mobile number</Text>
          <Text style={styles.subheading}>
            We will send a one-time password to verify your number.
          </Text>

          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <Input
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              containerStyle={styles.phoneInput}
              autoFocus
            />
          </View>

          <Button
            label="Send OTP"
            onPress={handleSend}
            loading={isLoading}
            disabled={!isValid}
            fullWidth
            size="lg"
            style={styles.cta}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg },
  inner:      { flex: 1, paddingHorizontal: SPACING.xl },
  back:       { paddingVertical: SPACING.lg },
  backText:   { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '500' },
  content:    { flex: 1, justifyContent: 'center', gap: SPACING.lg, paddingBottom: SPACING.xxxl },
  heading:    { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text },
  subheading: { fontSize: FONT_SIZE.base, color: COLORS.textMuted, lineHeight: 22 },
  phoneRow:   { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  countryCode: {
    height:          52,
    borderRadius:    RADIUS.md,
    borderWidth:     1,
    borderColor:     COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: SPACING.md,
  },
  countryText: { fontSize: FONT_SIZE.base, color: COLORS.text, fontWeight: '600' },
  phoneInput:  { flex: 1 },
  cta:         { marginTop: SPACING.sm },
});
