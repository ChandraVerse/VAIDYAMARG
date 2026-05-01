import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useCartStore } from '../../store/cart.store';
import type { MainTabProps } from '../../navigation/types';

export default function CartScreen({ navigation }: MainTabProps<'Cart'>) {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Search for medicines and add them here</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => (navigation as any).navigate('Search')}
        >
          <Text style={styles.shopBtnText}>Browse medicines</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Cart ({items.length} items)</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.medicineId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₹{item.genericPrice.toFixed(2)} each</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={() => updateQuantity(item.medicineId, item.quantity - 1)}>
                <Text style={styles.qBtn}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.medicineId, item.quantity + 1)}>
                <Text style={styles.qBtn}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Remove', `Remove ${item.name}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.medicineId) },
                ])
              }
              style={styles.del}
            >
              <Text style={styles.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => (navigation as any).navigate('Checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to checkout →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Clear cart', 'Remove all items?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCart },
        ])} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#f7f6f2' },
  header:         { fontSize: 20, fontWeight: '700', color: '#28251d', padding: 20, paddingTop: 56 },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: '#28251d', marginBottom: 6 },
  emptySubtitle:  { fontSize: 14, color: '#7a7974', marginBottom: 24, textAlign: 'center' },
  shopBtn:        { backgroundColor: '#01696f', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText:    { color: '#fff', fontWeight: '600', fontSize: 15 },
  row:            { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  name:           { fontSize: 14, fontWeight: '600', color: '#28251d', marginBottom: 3 },
  price:          { fontSize: 13, color: '#7a7974' },
  qtyRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12 },
  qBtn:           { fontSize: 20, color: '#01696f', paddingHorizontal: 6 },
  qty:            { fontSize: 15, fontWeight: '600', color: '#28251d', minWidth: 20, textAlign: 'center' },
  del:            { padding: 6 },
  delText:        { color: '#bab9b4', fontSize: 16 },
  footer:         { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f0ec' },
  totalRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel:     { fontSize: 16, color: '#7a7974' },
  totalAmount:    { fontSize: 20, fontWeight: '800', color: '#28251d' },
  checkoutBtn:    { backgroundColor: '#01696f', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  checkoutBtnText:{ color: '#fff', fontWeight: '700', fontSize: 16 },
  clearBtn:       { alignItems: 'center', paddingVertical: 8 },
  clearBtnText:   { color: '#a12c7b', fontSize: 14 },
});
