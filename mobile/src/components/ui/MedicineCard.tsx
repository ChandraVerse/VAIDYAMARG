import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme/colors';
import { useCartStore } from '../../store/cart.store';

interface MedicineCardProps {
  id:           string;
  name:         string;
  genericName:  string;
  brandPrice:   number;
  genericPrice: number;
  category:     string;
  unit:         string;
  inStock:      boolean;
}

export const MedicineCard: React.FC<MedicineCardProps> = (props) => {
  const router   = useRouter();
  const addItem  = useCartStore((s) => s.addItem);
  const savings  = Math.round(((props.brandPrice - props.genericPrice) / props.brandPrice) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/medicine/${props.id}`)}
      activeOpacity={0.85}
    >
      {/* Savings Badge */}
      {savings > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{savings}% OFF</Text>
        </View>
      )}

      {/* Medicine Name */}
      <Text style={styles.name} numberOfLines={1}>{props.name}</Text>
      <Text style={styles.generic} numberOfLines={1}>{props.genericName}</Text>
      <Text style={styles.category}>{props.category}</Text>

      {/* Price Comparison */}
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>₹{props.genericPrice}</Text>
          <Text style={styles.mrp}>₹{props.brandPrice} MRP</Text>
        </View>

        {props.inStock ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addItem({
              medicineId:  props.id,
              name:        props.name,
              genericName: props.genericName,
              price:       props.genericPrice,
              mrp:         props.brandPrice,
              unit:        props.unit,
            })}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.outOfStock}>Out of stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card:       { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: Colors.border, position: 'relative' },
  badge:      { position: 'absolute', top: 12, right: 12, backgroundColor: Colors.success,
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { color: Colors.white, fontSize: 11, fontWeight: '700' },
  name:       { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 4 },
  generic:    { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  category:   { fontSize: 11, color: Colors.primary, marginTop: 4, textTransform: 'uppercase',
                letterSpacing: 0.5, fontWeight: '500' },
  priceRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  price:      { fontSize: 20, fontWeight: '700', color: Colors.text },
  mrp:        { fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through', marginTop: 1 },
  addBtn:     { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 13 },
  outOfStock: { fontSize: 12, color: Colors.error, fontWeight: '500' },
});
