import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { useCartStore } from '@/stores/cart.store';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

export default function CartScreen() {
  const { items, removeItem, updateQty, totalAmount, requiresPrescription } = useCartStore();

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Search for medicines and add them here.</Text>
        <Button
          label="Browse Medicines"
          onPress={() => router.push('/(tabs)/search')}
          style={{ marginTop: SPACING.lg }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Cart ({items.length})</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.medicineId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                {item.requiresPrescription && (
                  <Text style={styles.rxNote}>Rx required</Text>
                )}
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.medicineId, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.medicineId, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {requiresPrescription() && (
              <View style={styles.rxWarning}>
                <Text style={styles.rxWarningText}>
                  One or more items require a valid prescription. You will be prompted to upload it at checkout.
                </Text>
              </View>
            )}
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{totalAmount().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>₹40.00</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{(totalAmount() + 40).toFixed(2)}</Text>
              </View>
            </Card>
            <Button
              label="Proceed to Checkout"
              onPress={() => router.push('/checkout')}
              fullWidth
              size="lg"
              style={{ marginTop: SPACING.md }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  center:       { alignItems: 'center', justifyContent: 'center' },
  heading:      { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, padding: SPACING.xl, paddingBottom: SPACING.md },
  list:         { padding: SPACING.xl, gap: SPACING.sm },
  itemCard:     { padding: SPACING.md },
  itemRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.md },
  itemInfo:     { flex: 1, gap: 2 },
  itemName:     { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.text },
  itemPrice:    { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.primary },
  rxNote:       { fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: '500' },
  qtyControl:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qtyBtn:       { width: 32, height: 32, borderRadius: RADIUS.sm, backgroundColor: COLORS.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:   { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary },
  qtyValue:     { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  footer:       { gap: SPACING.md, paddingBottom: SPACING.xxxl },
  rxWarning:    { backgroundColor: COLORS.warning + '18', borderRadius: RADIUS.md, padding: SPACING.md },
  rxWarningText:{ fontSize: FONT_SIZE.sm, color: COLORS.warning, lineHeight: 20 },
  summaryCard:  { gap: SPACING.sm },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  summaryValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  totalRow:     { paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.xs },
  totalLabel:   { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  totalValue:   { fontSize: FONT_SIZE.base, fontWeight: '800', color: COLORS.primary },
  emptyIcon:    { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle:   { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  emptyText:    { fontSize: FONT_SIZE.base, color: COLORS.textMuted, marginTop: SPACING.xs, textAlign: 'center' },
});
