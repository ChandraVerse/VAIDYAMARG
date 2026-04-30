import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/auth.store';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router      = useRouter();
  const { phone }   = useLocalSearchParams<{ phone: string }>();
  const verifyOtp   = useAuthStore((s) => s.verifyOtp);
  const sendOtp     = useAuthStore((s) => s.sendOtp);

  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading,   setLoading]   = useState(false);
  const [resendSec, setResendSec] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const successAnim = useRef(new Animated.Value(0)).current;

  // Resend countdown
  useEffect(() => {
    if (resendSec <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSec]);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1 && next.every(Boolean)) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const finalOtp = code || otp.join('');
    if (finalOtp.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      await verifyOtp(phone, finalOtp);

      // Success animation
      Animated.spring(successAnim, {
        toValue: 1, useNativeDriver: true, tension: 50, friction: 7,
      }).start();

      setTimeout(() => router.replace('/(tabs)/home'), 500);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please check and try again',
      });
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await sendOtp(phone);
      setResendSec(RESEND_SECONDS);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
      Toast.show({ type: 'success', text1: 'OTP resent successfully!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to resend. Try again.' });
    }
  };

  const successScale = successAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Animated.View style={{ transform: [{ scale: successScale }] }}>
          <Text style={styles.emoji}>📱</Text>
        </Animated.View>

        <Text style={styles.heading}>Verify your number</Text>
        <Text style={styles.sub}>
          Enter the 6-digit OTP sent to{`\n`}
          <Text style={styles.phone}>+91 {phone}</Text>
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                i === otp.findIndex((d) => !d) && styles.otpBoxActive,
              ]}
              value={digit}
              onChangeText={(t) => handleOtpChange(t, i)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Resend */}
        <TouchableOpacity onPress={handleResend} disabled={!canResend} style={styles.resendRow}>
          <Text style={[styles.resendText, canResend && styles.resendActive]}>
            {canResend ? 'Resend OTP' : `Resend in ${resendSec}s`}
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <Button
          title="Verify & Continue"
          onPress={() => handleVerify()}
          loading={loading}
          disabled={otp.filter(Boolean).length !== OTP_LENGTH}
          fullWidth
          size="lg"
          style={styles.verifyBtn}
        />

        {/* Dev hint */}
        {__DEV__ && (
          <Text style={styles.devHint}>Dev: use OTP 123456</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg, paddingHorizontal: 24,
                  paddingTop: 56, paddingBottom: 40 },
  back:         { marginBottom: 32 },
  backText:     { fontSize: 16, color: Colors.primary, fontWeight: '500' },
  emoji:        { fontSize: 52, textAlign: 'center', marginBottom: 16 },
  heading:      { fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  sub:          { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  phone:        { color: Colors.text, fontWeight: '600' },
  otpRow:       { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox:       { width: 48, height: 56, borderRadius: 14, borderWidth: 1.5,
                  borderColor: Colors.border, backgroundColor: Colors.surface,
                  fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight + '44' },
  otpBoxActive: { borderColor: Colors.primary, borderWidth: 2 },
  resendRow:    { alignItems: 'center', marginBottom: 32 },
  resendText:   { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  resendActive: { color: Colors.primary, fontWeight: '600' },
  verifyBtn:    { marginTop: 8 },
  devHint:      { textAlign: 'center', marginTop: 16, fontSize: 12,
                  color: Colors.textFaint, fontStyle: 'italic' },
});
