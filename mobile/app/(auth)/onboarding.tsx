import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  FlatList, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '💊',
    title: 'Save up to 80%\non medicines',
    subtitle: 'Switch from costly branded drugs to identical generic alternatives — same molecule, same effect.',
    accent: Colors.primary,
  },
  {
    id: '2',
    emoji: '📝',
    title: 'Upload your\nprescription',
    subtitle: 'Snap a photo of your prescription. Our pharmacists verify it within minutes.',
    accent: '#006494',
  },
  {
    id: '3',
    emoji: '🚚',
    title: 'Delivered to\nyour door',
    subtitle: 'Order verified medicines online and get them delivered fast — no more pharmacy queues.',
    accent: '#437a22',
  },
];

export default function OnboardingScreen() {
  const router     = useRouter();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX     = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Skip */}
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Big emoji illustration */}
            <View style={[styles.emojiCircle, { backgroundColor: item.accent + '18' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity, width: dotWidth }]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <Button
          title={index === SLIDES.length - 1 ? 'Get Started →' : 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.bg },
  skip:        { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText:    { color: Colors.textMuted, fontSize: 15, fontWeight: '500' },
  slide:       { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emojiCircle: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center',
                 alignItems: 'center', marginBottom: 40 },
  emoji:       { fontSize: 72 },
  title:       { fontSize: 32, fontWeight: '700', color: Colors.text, textAlign: 'center',
                 lineHeight: 40, marginBottom: 16 },
  subtitle:    { fontSize: 16, color: Colors.textMuted, textAlign: 'center', lineHeight: 26,
                 maxWidth: 300 },
  dots:        { flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                 gap: 6, marginBottom: 24 },
  dot:         { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  footer:      { paddingHorizontal: 24, paddingBottom: 48 },
});
