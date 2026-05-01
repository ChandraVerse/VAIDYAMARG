import { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import { Button, Card, Input } from '@/components/ui';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { ordersApi } from '@/services/api';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

export default function CheckoutScreen() {
  const { items, totalAmount, clearCart, requiresPrescription } = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState({
    line1: '', line2: '', city: '', state: '', pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const total = totalAmount() + 40; // includes delivery

  const isAddressValid =
    address.line1.trim().length > 3 &&
    address.city.trim().length > 1 &&
    address.state.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode);

  const handlePlaceOrder = async () => {
    if (!isAddressValid) {
      Toast.show({ type: 'error', text1: 'Please fill in a valid delivery address.' });
      return;
    }
    setLoading(true);
    try {
      // 1. Create order on backend → get Razorpay order ID
      const { data: orderRes } = await ordersApi.create({
        items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
        deliveryAddress: address,
        totalAmount: total,
      });

      const razorpayOrderId = orderRes.data.razorpayOrderId;
      const internalOrderId = orderRes.data.orderId;

      // 2. Open Razorpay payment sheet
      const paymentData = await RazorpayCheckout.open({
        key:         'rzp_test_XXXXXXXXXXXXXXXX', // replaced by env at build time
        amount:      Math.round(total * 100),
        currency:    'INR',
        name:        'VaidyaMarg',
        description: `Order #${internalOrderId.slice(-8).toUpperCase()}`,
        order_id:    razorpayOrderId,
        prefill: {
          contact: user?.phone ?? '',
          email:   user?.email ?? '',
        },
        theme: { color: COLORS.primary },
      });

      // 3. Verify payment signature on backend
      await ordersApi.verifyPayment({
        orderId:           internalOrderId,
        razorpayOrderId:   paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });

      clearCart();
      router.replace(`/order/${internalOrderId}`);
      Toast.show({ type: 'success', text1: 'Order placed', text2: 'Payment confirmed.' });
    } catch (err: any) {
      if (err?.code !== 'PAYMENT_CANCELLED') {
        Toast.show({ type: 'error', text1: 'Payment failed', text2: 'Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Delivery address */}
        <Text style={styles.sectionTitle}>Delivery address</Text>
        <Card style={styles.addressCard}>
          <Input label="Address line 1" value={address.line1} onChangeText={(v) => setAddress((a) => ({ ...a, line1: v }))} placeholder="House / Flat / Building" />
          <Input label="Address line 2 (optional)" value={address.line2} onChangeText={(v) => setAddress((a) => ({ ...a, line2: v }))} placeholder="Street / Area" />
          <View style={styles.row}>
            <Input label="City" value={address.city} onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))} containerStyle={styles.half} />
            <Input label="State" value={address.state} onChangeText={(v) => setAddress((a) => ({ ...a, state: v }))} containerStyle={styles.half} />
          </View>
          <Input label="Pincode" value={address.pincode} onChangeText={(v) => setAddress((a) => ({ ...a, pincode: v.replace(/\D/g, '').slice(0, 6) }))} placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} />
        </Card>

        {/* Prescription notice */}
        {requiresPrescription() && (
          <View style={styles.rxNotice}>
            <Text style={styles.rxNoticeText}>
              Your order contains prescription medicines. Please upload a valid prescription in the Prescriptions tab before placing your order.
            </Text>
          </View>
        )}

        {/* Order summary */}
        <Text style={styles.sectionTitle}>Order summary</Text>
        <Card style={styles.summaryCard}>
          {items.map((item) => (
            <View key={item.medicineId} style={styles.summaryRow}>
              <Text style={styles.summaryName} numberOfLines={1}>{item.name} × {item.quantity}</Text>
              <Text style={styles.summaryAmt}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryAmt}>₹40.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total payable</Text>
            <Text style={styles.totalAmt}>₹{total.toFixed(2)}</Text>
          </View>
        </Card>

        <Button
          label={loading ? 'Processing…' : `Pay ₹${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          disabled={loading || !isAddressValid}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.payBtn}
        />

        <Text style={styles.secure}>Secured by Razorpay · UPI · Cards · Net Banking</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.xl },
  backText:      { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '500' },
  topBarTitle:   { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  scroll:        { padding: SPACING.xl, gap: SPACING.md, paddingBottom: SPACING.xxxl },
  sectionTitle:  { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text, marginTop: SPACING.sm },
  addressCard:   { gap: SPACING.md },
  row:           { flexDirection: 'row', gap: SPACING.sm },
  half:          { flex: 1 },
  rxNotice:      { backgroundColor: COLORS.warning + '18', borderRadius: RADIUS.md, padding: SPACING.md },
  rxNoticeText:  { fontSize: FONT_SIZE.sm, color: COLORS.warning, lineHeight: 20 },
  summaryCard:   { gap: SPACING.sm },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryName:   { fontSize: FONT_SIZE.sm, color: COLORS.text, flex: 1 },
  summaryLabel:  { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  summaryAmt:    { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' },
  divider:       { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  totalRow:      { paddingTop: SPACING.sm },
  totalLabel:    { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  totalAmt:      { fontSize: FONT_SIZE.base, fontWeight: '800', color: COLORS.primary },
  payBtn:        { marginTop: SPACING.md },
  secure:        { fontSize: FONT_SIZE.xs, color: COLORS.textFaint, textAlign: 'center', marginTop: SPACING.sm },
});
