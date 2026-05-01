import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Hero illustration area */}
      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <Text style={styles.logoSymbol}>VM</Text>
        </View>
        <Text style={styles.appName}>VaidyaMarg</Text>
        <Text style={styles.tagline}>वैद्यमार्ग</Text>
      </View>

      {/* Value props */}
      <View style={styles.props}>
        {[
          { icon: '💊', text: 'Genuine medicines delivered to your door' },
          { icon: '📋', text: 'Upload prescriptions and get verified fast' },
          { icon: '🔍', text: 'Search generics and save on every order' },
        ].map((item) => (
          <View key={item.text} style={styles.propRow}>
            <Text style={styles.propIcon}>{item.icon}</Text>
            <Text style={styles.propText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          label="Get Started"
          onPress={() => router.push('/(auth)/phone')}
          fullWidth
          size="lg"
        />
        <Text style={styles.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: SPACING.xl },
  hero: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
  },
  logoMark: {
    width:           96,
    height:          96,
    borderRadius:    RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.md,
  },
  logoSymbol:  { fontSize: 32, fontWeight: '800', color: COLORS.white },
  appName:     { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text },
  tagline:     { fontSize: FONT_SIZE.lg,  color: COLORS.textMuted, letterSpacing: 2 },
  props: {
    gap:              SPACING.md,
    paddingVertical:  SPACING.xxl,
  },
  propRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  propIcon:   { fontSize: 22, width: 32, textAlign: 'center' },
  propText:   { fontSize: FONT_SIZE.base, color: COLORS.text, flex: 1, lineHeight: 22 },
  actions:    { gap: SPACING.md, paddingBottom: SPACING.lg },
  legal: {
    fontSize:  FONT_SIZE.xs,
    color:     COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
