import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { ordersApi } from '../../api/orders.api';
import { useCartStore } from '../../store/cart.store';
import { useOrdersStore } from '../../store/orders.store';
import type { RootStackProps } from '../../navigation/types';

export default function CheckoutScreen({ navigation }: RootStackProps<'Checkout'>) {
  const { items, totalAmount, clearCart } = useCartStore();
  const addOrder                          = useOrdersStore((s) => s.addOrder);
  const [address, setAddress]             = useState('');
  const [notes, setNotes]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Address required', 'Please enter a delivery address.');
      return;
    }
    setLoading(true);
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
      });
      const { order } = res.data;
      addOrder(order);
      clearCart();
      Alert.alert(
        '✅ Order placed!',
        `Order #${order.id.slice(-6).toUpperCase()} confirmed. Track it in My Orders.`,
        [{ text: 'Track order', onPress: () => navigation.replace('OrderTracking', { orderId: order.id }) }],
      );
    } catch (err: any) {
      Alert.alert('Order failed', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root}>
      <Text style={styles.sectionTitle}>Order summary</Text>
      <View style={styles.card}>
        {items.map((item) => (
          <View key={item.medicineId} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} ×{item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{(item.genericPrice * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Delivery details</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Delivery address *"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
        <TextInput
          style={styles.input}
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Place order — ₹{totalAmount.toFixed(2)}</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f7f6f2', padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#28251d', marginTop: 16, marginBottom: 10 },
  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 4 },
  itemRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f0ec' },
  itemName:     { fontSize: 14, color: '#28251d' },
  itemPrice:    { fontSize: 14, fontWeight: '600', color: '#28251d' },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, marginTop: 4 },
  totalLabel:   { fontSize: 15, color: '#7a7974' },
  totalAmount:  { fontSize: 18, fontWeight: '800', color: '#01696f' },
  input:        { borderWidth: 1, borderColor: '#dcd9d5', borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 10, backgroundColor: '#f9f8f5' },
  btn:          { backgroundColor: '#01696f', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 17 },
});
