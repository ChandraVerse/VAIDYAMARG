import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';
import { medicinesApi } from '../../src/api/medicines.api';
import { useCartStore } from '../../src/store/cart.store';

export default function MedicineDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();
  const addItem   = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const { data: medicine, isLoading } = useQuery({
    queryKey: ['medicine', id],
    queryFn:  () => medicinesApi.detail(id).then((r) => r.data.data),
  });

  const { data: comparison } = useQuery({
    queryKey: ['compare', medicine?.name],
    queryFn:  () => medicinesApi.compare(medicine.name).then((r) => r.data.data),
    enabled:  !!medicine?.name,
  });

  if (isLoading || !medicine) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 32 }}>💊</Text>
        <Text style={{ color: Colors.textMuted, marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  const savings = medicine.mrp - medicine.price;
  const savingsPct = Math.round((savings / medicine.mrp) * 100);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        medicineId:  medicine.id,
        name:        medicine.name,
        genericName: medicine.genericName,
        price:       medicine.price,
        mrp:         medicine.mrp,
        unit:        medicine.unit,
      });
    }
    Toast.show({ type: 'success', text1: `${medicine.name} added to cart`, text2: `${qty} unit${qty > 1 ? 's' : ''}` });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ────────────────────────────────────────────── */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>💊</Text>
          {savingsPct > 0 && (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save {savingsPct}%</Text>
            </View>
          )}
          <Text style={styles.name}>{medicine.name}</Text>
          <Text style={styles.generic}>{medicine.genericName}</Text>
          <Text style={styles.category}>{medicine.category}</Text>
        </View>

        {/* ── Price Box ───────────────────────────────────────── */}
        <View style={styles.priceBox}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>Generic Price</Text>
            <Text style={styles.priceMain}>₹{medicine.price}</Text>
            <Text style={styles.priceUnit}>per {medicine.unit}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>Brand MRP</Text>
            <Text style={[styles.priceMain, styles.priceMrp]}>₹{medicine.mrp}</Text>
            <Text style={[styles.priceUnit, { color: Colors.success }]}>Save ₹{savings}</Text>
          </View>
        </View>

        {/* ── Brand vs Generic Comparison ─────────────────────── */}
        {comparison?.brandVersions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand vs Generic Comparison</Text>
            <View style={styles.compareTable}>
              <View style={styles.compareHeader}>
                <Text style={styles.compareHeaderText}>Brand</Text>
                <Text style={styles.compareHeaderText}>Generic</Text>
                <Text style={styles.compareHeaderText}>You Save</Text>
              </View>
              {comparison.brandVersions.slice(0, 4).map((v: any, i: number) => (
                <View key={i} style={styles.compareRow}>
                  <Text style={styles.compareBrand}>{v.brandName}</Text>
                  <Text style={styles.compareGeneric}>{medicine.genericName}</Text>
                  <Text style={styles.compareSave}>₹{v.mrp - medicine.price}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Details ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicine Details</Text>
          {[
            { label: 'Generic Name',  value: medicine.genericName },
            { label: 'Category',      value: medicine.category },
            { label: 'Form',          value: medicine.form },
            { label: 'Strength',      value: medicine.strength },
            { label: 'Manufacturer',  value: medicine.manufacturer },
            { label: 'HSN Code',      value: medicine.hsnCode },
          ].filter(r => r.value).map(({ label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Qty Selector ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(Math.max(1, qty - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(Math.min(20, qty + 1))}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.qtyTotal}>= ₹{(medicine.price * qty).toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Sticky Bottom CTA ────────────────────────────────── */}
      <View style={styles.stickyBottom}>
        <Button
          title={medicine.inStock ? `Add to Cart · ₹${(medicine.price * qty).toFixed(2)}` : 'Out of Stock'}
          onPress={handleAddToCart}
          disabled={!medicine.inStock}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  hero:            { backgroundColor: Colors.surface, padding: 24, alignItems: 'center',
                     borderBottomWidth: 1, borderBottomColor: Colors.divider, position: 'relative' },
  heroEmoji:       { fontSize: 64, marginBottom: 12 },
  saveBadge:       { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.success,
                     borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  saveBadgeText:   { color: Colors.white, fontSize: 12, fontWeight: '700' },
  name:            { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  generic:         { fontSize: 15, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  category:        { fontSize: 12, color: Colors.primary, marginTop: 6, textTransform: 'uppercase',
                     letterSpacing: 1, fontWeight: '600' },
  priceBox:        { flexDirection: 'row', backgroundColor: Colors.surface, margin: 16,
                     borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  priceCol:        { flex: 1, padding: 16, alignItems: 'center' },
  priceDivider:    { width: 1, backgroundColor: Colors.divider },
  priceLabel:      { fontSize: 11, color: Colors.textMuted, fontWeight: '600',
                     textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  priceMain:       { fontSize: 28, fontWeight: '800', color: Colors.text },
  priceMrp:        { textDecorationLine: 'line-through', color: Colors.textMuted, fontSize: 22 },
  priceUnit:       { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  section:         { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  compareTable:    { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  compareHeader:   { flexDirection: 'row', backgroundColor: Colors.surfaceOffset,
                     paddingHorizontal: 12, paddingVertical: 8 },
  compareHeaderText:{ flex: 1, fontSize: 11, fontWeight: '700', color: Colors.textMuted,
                      textTransform: 'uppercase', letterSpacing: 0.5 },
  compareRow:      { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10,
                     borderTopWidth: 1, borderTopColor: Colors.divider },
  compareBrand:    { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '500' },
  compareGeneric:  { flex: 1, fontSize: 13, color: Colors.primary },
  compareSave:     { flex: 1, fontSize: 13, color: Colors.success, fontWeight: '700' },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between',
                     paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel:     { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  detailValue:     { fontSize: 13, color: Colors.text, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  qtyRow:          { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn:          { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.surface,
                     borderWidth: 1.5, borderColor: Colors.border,
                     justifyContent: 'center', alignItems: 'center' },
  qtyBtnText:      { fontSize: 20, color: Colors.text, fontWeight: '600', lineHeight: 24 },
  qtyValue:        { fontSize: 20, fontWeight: '700', color: Colors.text, minWidth: 32, textAlign: 'center' },
  qtyTotal:        { fontSize: 16, fontWeight: '700', color: Colors.primary },
  stickyBottom:    { position: 'absolute', bottom: 0, left: 0, right: 0,
                     padding: 16, backgroundColor: Colors.surface,
                     borderTopWidth: 1, borderTopColor: Colors.border },
});
