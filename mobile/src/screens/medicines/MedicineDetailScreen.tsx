import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { medicinesApi } from '../../api/medicines.api';
import { useCartStore } from '../../store/cart.store';
import type { RootStackProps } from '../../navigation/types';

type Medicine = {
  id: string; name: string; genericName: string; description?: string;
  category: string; manufacturer?: string; genericPrice: number; mrp: number;
  stock: number; isActive: boolean; requiresPrescription: boolean;
};

export default function MedicineDetailScreen({
  route, navigation,
}: RootStackProps<'MedicineDetail'>) {
  const { medicineId }   = route.params;
  const [med, setMed]    = useState<Medicine | null>(null);
  const [qty, setQty]    = useState(1);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    medicinesApi
      .getOne(medicineId)
      .then((res) => setMed(res.data))
      .catch(() => Alert.alert('Error', 'Could not load medicine details'))
      .finally(() => setLoading(false));
  }, [medicineId]);

  const handleAdd = () => {
    if (!med) return;
    addItem({ medicineId: med.id, name: med.name, genericPrice: med.genericPrice, quantity: qty });
    Alert.alert('Added to cart', `${qty}× ${med.name} added.`, [
      { text: 'Continue shopping' },
      { text: 'View cart', onPress: () => navigation.navigate('Main') },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#01696f" />;
  if (!med)    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Not found</Text></View>;

  const saving = ((med.mrp - med.genericPrice) / med.mrp * 100).toFixed(0);

  return (
    <ScrollView style={styles.root}>
      {/* Price hero */}
      <View style={styles.hero}>
        <Text style={styles.name}>{med.name}</Text>
        <Text style={styles.generic}>{med.genericName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{med.genericPrice.toFixed(2)}</Text>
          <Text style={styles.mrp}>₹{med.mrp.toFixed(2)}</Text>
          <View style={styles.saveBadge}><Text style={styles.saveText}>{saving}% off</Text></View>
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        {[
          ['Category',     med.category],
          ['Manufacturer', med.manufacturer ?? '—'],
          ['Stock',        med.stock > 0 ? `${med.stock} units available` : 'Out of stock'],
          ['Prescription', med.requiresPrescription ? 'Required' : 'Not required'],
        ].map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}
        {med.description && (
          <><Text style={styles.descLabel}>Description</Text>
          <Text style={styles.desc}>{med.description}</Text></>
        )}
      </View>

      {/* Quantity + Add */}
      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => Math.min(med.stock, q + 1))}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, (!med.isActive || med.stock === 0) && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!med.isActive || med.stock === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>
            {med.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#f7f6f2' },
  hero:           { backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  name:           { fontSize: 22, fontWeight: '700', color: '#28251d' },
  generic:        { fontSize: 14, color: '#7a7974', marginTop: 4, marginBottom: 12 },
  priceRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price:          { fontSize: 26, fontWeight: '800', color: '#01696f' },
  mrp:            { fontSize: 15, color: '#bab9b4', textDecorationLine: 'line-through' },
  saveBadge:      { backgroundColor: '#cedcd8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  saveText:       { fontSize: 12, color: '#01696f', fontWeight: '700' },
  section:        { backgroundColor: '#fff', marginHorizontal: 0, padding: 20 },
  row:            { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f0ec' },
  rowLabel:       { fontSize: 14, color: '#7a7974' },
  rowValue:       { fontSize: 14, fontWeight: '500', color: '#28251d', maxWidth: '60%', textAlign: 'right' },
  descLabel:      { fontSize: 14, fontWeight: '600', color: '#28251d', marginTop: 16, marginBottom: 6 },
  desc:           { fontSize: 14, color: '#7a7974', lineHeight: 21 },
  footer:         { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: '#fff', marginTop: 12 },
  qtyRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#dcd9d5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtn:         { paddingHorizontal: 8 },
  qtyBtnText:     { fontSize: 20, color: '#01696f', fontWeight: '700' },
  qtyNum:         { fontSize: 16, fontWeight: '600', color: '#28251d', minWidth: 24, textAlign: 'center' },
  addBtn:         { flex: 1, backgroundColor: '#01696f', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#bab9b4' },
  addBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
