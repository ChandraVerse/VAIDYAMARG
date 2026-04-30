import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useCartStore } from '../../src/store/cart.store';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function CartScreen() {
  const router       = useRouter();
  const { items, totalAmount, totalSavings, updateQty, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          message="Search for medicines and add them to your cart to get started."
          actionLabel="Browse Medicines"
          onAction={() => router.push('/(tabs)/search')}
        />
      </View>
    );
  }

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart ({items.length})</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearAll}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.medicineId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {/* Savings callout */}
            {totalSavings > 0 && (
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsEmoji}>🎉</Text>
                <Text style={styles.savingsText}>
                  You're saving{' '}
                  <Text style={{ fontWeight: '800', color: Colors.success }}>₹{totalSavings.toFixed(0)}</Text>
                  {' '}by choosing generics!
                </Text>
              </View>
            )}

            {/* Bill summary */}
            <View style={styles.billBox}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Subtotal ({items.length} items)</Text>
                <Text style={styles.billValue}>₹{(totalAmount + totalSavings).toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: Colors.success }]}>Generic Discount</Text>
                <Text style={[styles.billValue, { color: Colors.success }]}>-₹{totalSavings.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery</Text>
                <Text style={[styles.billValue, { color: Colors.success }]}>FREE</Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRow}>
                <Text style={styles.billTotal}>Total</Text>
                <Text style={styles.billTotalValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>
            <View style={{ height: 120 }} />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemGeneric} numberOfLines={1}>{item.genericName}</Text>
              <View style={styles.itemPriceRow}>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <Text style={styles.itemMrp}>₹{item.mrp} MRP</Text>
              </View>
            </View>

            {/* Qty controls */}
            <View style={styles.qtyBox}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.medicineId, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑️' : '−'}</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQty(item.medicineId, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      {/* Sticky Checkout */}
      <View style={styles.stickyBottom}>
        <Button
          title={`Proceed to Checkout · ₹${totalAmount.toFixed(2)}`}
          onPress={() => router.push('/checkout')}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                     paddingTop: (StatusBar.currentHeight || 44) + 12,
                     paddingHorizontal: 20, paddingBottom: 16,
                     backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle:     { fontSize: 20, fontWeight: '700', color: Colors.text },
  clearAll:        { fontSize: 13, color: Colors.error, fontWeight: '600' },
  list:            { padding: 16 },
  cartItem:        { flexDirection: 'row', alignItems: 'center', gap: 12,
                     backgroundColor: Colors.surface, borderRadius: 16,
                     borderWidth: 1, borderColor: Colors.border,
                     padding: 14, marginBottom: 10 },
  itemInfo:        { flex: 1 },
  itemName:        { fontSize: 14, fontWeight: '600', color: Colors.text },
  itemGeneric:     { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  itemPriceRow:    { flexDirection: 'row', gap: 6, alignItems: 'baseline', marginTop: 4 },
  itemPrice:       { fontSize: 15, fontWeight: '700', color: Colors.text },
  itemMrp:         { fontSize: 11, color: Colors.textMuted, textDecorationLine: 'line-through' },
  qtyBox:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn:          { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surfaceOffset,
                     borderWidth: 1, borderColor: Colors.border,
                     justifyContent: 'center', alignItems: 'center' },
  qtyBtnText:      { fontSize: 14, color: Colors.text },
  qtyNum:          { fontSize: 15, fontWeight: '700', color: Colors.text, minWidth: 24, textAlign: 'center' },
  itemTotal:       { fontSize: 14, fontWeight: '700', color: Colors.primary, minWidth: 60, textAlign: 'right' },
  savingsBanner:   { flexDirection: 'row', alignItems: 'center', gap: 10,
                     backgroundColor: Colors.success + '15', borderRadius: 14,
                     borderWidth: 1, borderColor: Colors.success + '40',
                     padding: 14, marginBottom: 16 },
  savingsEmoji:    { fontSize: 24 },
  savingsText:     { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  billBox:         { backgroundColor: Colors.surface, borderRadius: 16,
                     borderWidth: 1, borderColor: Colors.border, padding: 16 },
  billTitle:       { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  billRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel:       { fontSize: 13, color: Colors.textMuted },
  billValue:       { fontSize: 13, color: Colors.text, fontWeight: '500' },
  billDivider:     { height: 1, backgroundColor: Colors.divider, marginVertical: 10 },
  billTotal:       { fontSize: 15, fontWeight: '700', color: Colors.text },
  billTotalValue:  { fontSize: 15, fontWeight: '800', color: Colors.text },
  stickyBottom:    { position: 'absolute', bottom: 0, left: 0, right: 0,
                     padding: 16, backgroundColor: Colors.surface,
                     borderTopWidth: 1, borderTopColor: Colors.border },
});
