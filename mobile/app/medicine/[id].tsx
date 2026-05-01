import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Button, Card } from '@/components/ui';
import { medicinesApi } from '@/services/api';
import { useCartStore } from '@/stores/cart.store';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const { data: medicine, isLoading, isError } = useQuery({
    queryKey: ['medicine', id],
    queryFn:  () => medicinesApi.detail(id).then((r) => r.data.data),
    enabled:  !!id,
  });

  const inCart = cartItems.some((i) => i.medicineId === id);

  const handleAddToCart = () => {
    if (!medicine) return;
    addItem({
      medicineId:           medicine.id,
      name:                 medicine.name,
      price:                medicine.price,
      imageUrl:             medicine.imageUrl ?? null,
      requiresPrescription: medicine.requiresPrescription ?? false,
    });
    Toast.show({ type: 'success', text1: 'Added to cart', text2: medicine.name });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (isError || !medicine) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Could not load medicine details.</Text>
        <Button label="Go back" onPress={() => router.back()} variant="ghost" style={{ marginTop: SPACING.lg }} />
      </SafeAreaView>
    );
  }

  const discount = medicine.mrp && medicine.mrp > medicine.price
    ? Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>Medicine Detail</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
          <Text style={{ fontSize: 22 }}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image placeholder */}
        <View style={styles.imageContainer}>
          <Text style={{ fontSize: 64 }}>💊</Text>
        </View>

        <View style={styles.body}>
          {/* Name & manufacturer */}
          <Text style={styles.name}>{medicine.name}</Text>
          <Text style={styles.manufacturer}>{medicine.manufacturer}</Text>
          <Text style={styles.form}>{medicine.form} · {medicine.strength}</Text>

          {medicine.requiresPrescription && (
            <View style={styles.rxBanner}>
              <Text style={styles.rxText}>Prescription required for this medicine</Text>
            </View>
          )}

          {/* Pricing */}
          <Card style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>₹{medicine.price?.toFixed(2)}</Text>
                {medicine.mrp && medicine.mrp > medicine.price && (
                  <Text style={styles.mrp}>MRP ₹{medicine.mrp?.toFixed(2)}</Text>
                )}
              </View>
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% off</Text>
                </View>
              )}
            </View>
            <Text style={styles.stockStatus}>
              {medicine.stock > 0
                ? `In stock · ${medicine.stock} units available`
                : 'Out of stock'}
            </Text>
          </Card>

          {/* Key info */}
          {medicine.composition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Composition</Text>
              <Text style={styles.sectionBody}>{medicine.composition}</Text>
            </View>
          )}

          {medicine.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this medicine</Text>
              <Text style={styles.sectionBody}>{medicine.description}</Text>
            </View>
          )}

          {medicine.sideEffects && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common side effects</Text>
              <Text style={styles.sectionBody}>{medicine.sideEffects}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View style={styles.stickyBottom}>
        <Button
          label={inCart ? 'Go to Cart' : medicine.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          onPress={inCart ? () => router.push('/(tabs)/cart') : handleAddToCart}
          disabled={medicine.stock <= 0}
          fullWidth
          size="lg"
          variant={inCart ? 'secondary' : 'primary'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  center:         { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        SPACING.xl,
    paddingBottom:  SPACING.md,
  },
  backBtn:        { padding: SPACING.xs },
  backText:       { fontSize: 22, color: COLORS.text },
  topBarTitle:    { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.text, flex: 1, textAlign: 'center' },
  imageContainer: {
    height:         180,
    backgroundColor: COLORS.surface,
    alignItems:     'center',
    justifyContent: 'center',
  },
  body:           { padding: SPACING.xl, gap: SPACING.sm },
  name:           { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  manufacturer:   { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  form:           { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  rxBanner: {
    backgroundColor: COLORS.warning + '18',
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginTop:       SPACING.xs,
  },
  rxText:         { fontSize: FONT_SIZE.sm, color: COLORS.warning, fontWeight: '500' },
  priceCard:      { marginVertical: SPACING.md },
  priceRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xs },
  price:          { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  mrp: {
    fontSize:            FONT_SIZE.sm,
    color:               COLORS.textFaint,
    textDecorationLine:  'line-through',
  },
  discountBadge: {
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical:  4,
    borderRadius:    RADIUS.sm,
  },
  discountText:   { fontSize: FONT_SIZE.sm, color: COLORS.success, fontWeight: '700' },
  stockStatus:    { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  section:        { gap: SPACING.xs, marginTop: SPACING.md },
  sectionTitle:   { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  sectionBody:    { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, lineHeight: 20 },
  errorText:      { fontSize: FONT_SIZE.base, color: COLORS.error },
  stickyBottom: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    padding:         SPACING.xl,
    backgroundColor: COLORS.bg,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
  },
});
