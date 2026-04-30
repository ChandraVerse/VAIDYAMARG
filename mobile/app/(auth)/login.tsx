import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Animated, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/auth.store';

export default function LoginScreen() {
  const router   = useRouter();
  const sendOtp  = useAuthStore((s) => s.sendOtp);

  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed,  setAgreed]  = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) { shake(); return; }
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Please accept the terms to continue' });
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send OTP',
        text2: err?.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚕️</Text>
          <Text style={styles.brand}>VaidyaMarg</Text>
          <Text style={styles.tagline}>India's Generic Medicine Platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Enter your{`\n`}mobile number</Text>
          <Text style={styles.sub}>We'll send a 6-digit OTP to verify</Text>

          {/* Phone Input */}
          <Animated.View
            style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}
          >
            <View style={styles.flagBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.dial}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textFaint}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
              autoFocus
            />
          </Animated.View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* CTA */}
          <Button
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            disabled={phone.length !== 10}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Trust badges */}
        <View style={styles.trust}>
          {['🔒 Secure & Private', '✅ CDSCO Compliant', '💊 1Cr+ Medicines'].map((t) => (
            <Text key={t} style={styles.trustText}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow: 1, backgroundColor: Colors.bg, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 32 },
  header:        { alignItems: 'center', marginBottom: 32 },
  logo:          { fontSize: 52, marginBottom: 8 },
  brand:         { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  tagline:       { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  card:          { backgroundColor: Colors.surface, borderRadius: 24, padding: 24,
                   borderWidth: 1, borderColor: Colors.border },
  heading:       { fontSize: 26, fontWeight: '700', color: Colors.text, lineHeight: 34, marginBottom: 6 },
  sub:           { fontSize: 14, color: Colors.textMuted, marginBottom: 24 },
  inputWrapper:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
                   borderColor: Colors.border, borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  flagBox:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14,
                   paddingVertical: 14, backgroundColor: Colors.surfaceOffset, borderRightWidth: 1,
                   borderRightColor: Colors.border },
  flag:          { fontSize: 18 },
  dial:          { fontSize: 15, fontWeight: '600', color: Colors.text },
  input:         { flex: 1, fontSize: 18, fontWeight: '600', color: Colors.text,
                   paddingHorizontal: 14, paddingVertical: 14, letterSpacing: 2 },
  termsRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 },
  checkbox:      { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.border,
                   justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText:     { flex: 1, fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  termsLink:     { color: Colors.primary, fontWeight: '600' },
  trust:         { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 32 },
  trustText:     { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
});
