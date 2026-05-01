import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp]         = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setTimer] = useState(30);
  const refs = useRef<(TextInput | null)[]>([]);
  const { verifyOtp, sendOtp, isLoading } = useAuthStore();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    try {
      await verifyOtp(phone, code);
      router.replace('/(tabs)/home');
    } catch {
      Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please check and try again.' });
      setOtp(Array(OTP_LENGTH).fill(''));
      refs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone);
      setTimer(30);
      Toast.show({ type: 'success', text1: 'OTP resent' });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not resend OTP' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.heading}>Verify your number</Text>
          <Text style={styles.subheading}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => { refs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : {},
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>Resend OTP in {resendTimer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            label="Verify"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.join('').length < OTP_LENGTH}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  inner:            { flex: 1, paddingHorizontal: SPACING.xl },
  back:             { paddingVertical: SPACING.lg },
  backText:         { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '500' },
  content:          { flex: 1, justifyContent: 'center', gap: SPACING.lg, paddingBottom: SPACING.xxxl },
  heading:          { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text },
  subheading:       { fontSize: FONT_SIZE.base, color: COLORS.textMuted, lineHeight: 22 },
  phoneHighlight:   { color: COLORS.text, fontWeight: '600' },
  otpRow:           { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'space-between' },
  otpBox: {
    width:           46,
    height:          56,
    borderRadius:    RADIUS.md,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    backgroundColor: COLORS.surface,
    textAlign:       'center',
    fontSize:        FONT_SIZE.xl,
    fontWeight:      '700',
    color:           COLORS.text,
  },
  otpBoxFilled:     { borderColor: COLORS.primary, backgroundColor: COLORS.primaryHighlight },
  resendRow:        { alignItems: 'center' },
  resendTimer:      { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  resendLink:       { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
});
