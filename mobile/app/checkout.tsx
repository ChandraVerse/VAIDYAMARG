import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import { Colors } from '../src/theme/colors';
import { Button } from '../src/components/ui/Button';
import { useCartStore } from '../src/store/cart.store';
import { useAuthStore } from '../src/store/auth.store';
import { ordersApi } from '../src/api/orders.api';
import { usersApi } from '../src/api/users.api';
import { prescriptionsApi } from '../src/api/prescriptions.api';

export default function CheckoutScreen() {
  const router      = useRouter();
  const user        = useAuthStore((s) => s.user);
  const { items, totalAmount, totalSavings, clearCart } = useCartStore();

  const [selectedAddress,      setSelectedAddress]      = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [paymentMethod,        setPaymentMethod]        = useState<'ONLINE' | 'COD'>('ONLINE');

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => usersApi.getAddresses().then((r) => r.data.data),
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['my-prescriptions'],
    queryFn:  () => prescriptionsApi.myList().then((r) => r.data.data),
  });

  // Determine if any item needs prescription
  const needsPrescription = items.some((i) => i.requiresPrescription);

  const placeMutation = useMutation({
    mutationFn: (data: any) => ordersApi.place(data),
    onSuccess: async ({ data }) => {
      const order = data.data;

      if (paymentMethod === 'COD') {
        clearCart();
        router.replace(`/order/${order.id}`);
        return;
      }

      // Razorpay payment
      const options = {
        description:  'VaidyaMarg Medicine Order',
        image:        'https://i.imgur.com/3g7nmCe.png',
        currency:     'INR',
        key:          process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '',
        amount:       order.razorpayAmount, // paise
        order_id:     order.razorpayOrderId,
        name:         'VaidyaMarg',
        prefill: {
          email: user?.email  || '',
          contact: `+91${user?.phone}`,
          name:  user?.name   || '',
        },
        theme: { color: Colors.primary },
      };

      try {
        const paymentData = await RazorpayCheckout.open(options);

        await ordersApi.verifyPayment({
          orderId:            order.id,
          razorpayOrderId:    paymentData.razorpay_order_id,
          razorpayPaymentId:  paymentData.razorpay_payment_id,
          razorpaySignature:  paymentData.razorpay_signature,
        });

        clearCart();
        Toast.show({ type: 'success', text1: '🎉 Payment successful!', text2: 'Your order has been placed.' });
        router.replace(`/order/${order.id}`);

      } catch (err: any) {
        if (err.code !== 2) { // code 2 = user cancelled
          Toast.show({ type: 'error', text1: 'Payment failed', text2: 'Please try again or use COD.' });
        }
      }
    },
    onError: (err: any) => {
      Toast.show({ type: 'error', text1: 'Order failed', text2: err?.response?.data?.message });
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Toast.show({ type: 'error', text1: 'Please select a delivery address' });
      return;
    }
    if (needsPrescription && !selectedPrescription) {
      Toast.show({ type: 'error', text1: 'Prescription required', text2: 'Please attach a verified prescription' });
      return;
    }

    placeMutation.mutate({
      items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
      addressId:      selectedAddress,
      prescriptionId: selectedPrescription,
      paymentMethod,
    });
  };

  const defaultAddr = addresses?.find((a: any) => a.isDefault) || addresses?.[0];
  if (!selectedAddress && defaultAddr) setSelectedAddress(defaultAddr.id);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Delivery Address ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
        {addresses?.length === 0 ? (
          <TouchableOpacity
            style={styles.addAddr}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.addAddrText}>+ Add a delivery address</Text>
          </TouchableOpacity>
        ) : (
          addresses?.map((addr: any) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addrCard, selectedAddress === addr.id && styles.addrCardSelected]}
              onPress={() => setSelectedAddress(addr.id)}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {selectedAddress === addr.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.addrInfo}>
                <Text style={styles.addrName}>{addr.label || addr.fullName}</Text>
                <Text style={styles.addrLine}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Text>
                <Text style={styles.addrLine}>{addr.city}, {addr.state} {addr.pincode}</Text>
              </View>
              {addr.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* ── Prescription (if needed) ─────────────────────────── */}
        {needsPrescription && (
          <>
            <Text style={styles.sectionTitle}>📝 Prescription</Text>
            {prescriptions?.filter((p: any) => p.status === 'VERIFIED').length === 0 ? (
              <View style={styles.rxWarning}>
                <Text style={styles.rxWarningText}>
                  ⚠️ Some items need a verified prescription.
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/prescription')}>
                  <Text style={styles.rxLink}>Upload Prescription →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              prescriptions
                ?.filter((p: any) => p.status === 'VERIFIED')
                .map((rx: any) => (
                  <TouchableOpacity
                    key={rx.id}
                    style={[styles.addrCard, selectedPrescription === rx.id && styles.addrCardSelected]}
                    onPress={() => setSelectedPrescription(rx.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioOuter}>
                      {selectedPrescription === rx.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.addrInfo}>
                      <Text style={styles.addrName}>✅ Verified Prescription</Text>
                      <Text style={styles.addrLine}>
                        {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </>
        )}

        {/* ── Order Items ─────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>🛒 Order Items ({items.length})</Text>
        <View style={styles.itemsBox}>
          {items.map((item, i) => (
            <View
              key={item.medicineId}
              style={[styles.orderItem, i < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.divider }]}
            >
              <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.orderItemQty}>x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* ── Payment Method ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
        <View style={styles.paymentRow}>
          {[
            { id: 'ONLINE', emoji: '📱', label: 'Online Payment', sub: 'UPI, Card, Net Banking' },
            { id: 'COD',    emoji: '💵', label: 'Cash on Delivery', sub: 'Pay when delivered' },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.payCard, paymentMethod === method.id && styles.payCardSelected]}
              onPress={() => setPaymentMethod(method.id as any)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>{method.emoji}</Text>
              <Text style={styles.payLabel}>{method.label}</Text>
              <Text style={styles.paySub}>{method.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Bill Summary ────────────────────────────────────── */}
        <View style={styles.billBox}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>MRP Total</Text>
            <Text style={styles.billValue}>₹{(totalAmount + totalSavings).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: Colors.success }]}>Generic Savings</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>-₹{totalSavings.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery</Text>
            <Text style={[styles.billValue, { color: Colors.success }]}>FREE</Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotal}>Amount Payable</Text>
            <Text style={styles.billTotalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Place Order */}
      <View style={styles.stickyBottom}>
        <Button
          title={
            placeMutation.isPending ? 'Placing order…' :
            paymentMethod === 'COD' ? `Place Order · ₹${totalAmount.toFixed(2)}` :
            `Pay ₹${totalAmount.toFixed(2)} · Razorpay`
          }
          onPress={handlePlaceOrder}
          loading={placeMutation.isPending}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content:          { padding: 16 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 8 },
  addAddr:          { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1.5,
                      borderColor: Colors.primary, borderStyle: 'dashed',
                      padding: 16, alignItems: 'center', marginBottom: 16 },
  addAddrText:      { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  addrCard:         { flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                      backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1.5, borderColor: Colors.border,
                      padding: 14, marginBottom: 10 },
  addrCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  radioOuter:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                      borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  radioInner:       { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  addrInfo:         { flex: 1 },
  addrName:         { fontSize: 14, fontWeight: '600', color: Colors.text },
  addrLine:         { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 18 },
  defaultBadge:     { backgroundColor: Colors.primary + '18', borderRadius: 6,
                      paddingHorizontal: 8, paddingVertical: 3 },
  defaultBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  rxWarning:        { backgroundColor: Colors.warning + '15', borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.warning + '40',
                      padding: 14, marginBottom: 16 },
  rxWarningText:    { fontSize: 13, color: Colors.text, marginBottom: 6 },
  rxLink:           { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  itemsBox:         { backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  orderItem:        { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  orderItemName:    { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '500' },
  orderItemQty:     { fontSize: 12, color: Colors.textMuted, minWidth: 24 },
  orderItemPrice:   { fontSize: 13, fontWeight: '700', color: Colors.text },
  paymentRow:       { flexDirection: 'row', gap: 12, marginBottom: 16 },
  payCard:          { flex: 1, backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1.5, borderColor: Colors.border,
                      padding: 14, alignItems: 'center' },
  payCardSelected:  { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  payLabel:         { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  paySub:           { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  billBox:          { backgroundColor: Colors.surface, borderRadius: 16,
                      borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 16 },
  billRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel:        { fontSize: 13, color: Colors.textMuted },
  billValue:        { fontSize: 13, color: Colors.text, fontWeight: '500' },
  billDivider:      { height: 1, backgroundColor: Colors.divider, marginVertical: 6 },
  billTotal:        { fontSize: 15, fontWeight: '700', color: Colors.text },
  billTotalValue:   { fontSize: 15, fontWeight: '800', color: Colors.primary },
  stickyBottom:     { position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: 16, backgroundColor: Colors.surface,
                      borderTopWidth: 1, borderTopColor: Colors.border },
});
