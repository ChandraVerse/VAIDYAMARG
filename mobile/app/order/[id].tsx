import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';
import { ordersApi } from '../../src/api/orders.api';

const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Order Placed',   emoji: '📝' },
  { key: 'CONFIRMED',  label: 'Confirmed',      emoji: '✅' },
  { key: 'PACKED',     label: 'Packed',         emoji: '📦' },
  { key: 'DISPATCHED', label: 'Out for Delivery',emoji: '🚚' },
  { key: 'DELIVERED',  label: 'Delivered',      emoji: '🎉' },
];

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function OrderTrackingScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey:        ['order', id],
    queryFn:         () => ordersApi.track(id).then((r) => r.data.data),
    refetchInterval: 30000, // poll every 30s
  });

  if (isLoading || !order) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 36 }}>🚚</Text>
        <Text style={{ color: Colors.textMuted, marginTop: 8 }}>Loading order…</Text>
      </View>
    );
  }

  const stepIdx    = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Order ID & Date ─────────────────────────────────── */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
          <View style={[styles.statusPill, isCancelled && { backgroundColor: Colors.error + '20' }]}>
            <Text style={[styles.statusText, isCancelled && { color: Colors.error }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* ── Progress Tracker ─────────────────────────────────── */}
        {!isCancelled && (
          <View style={styles.tracker}>
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= stepIdx;
              const current = i === stepIdx;
              const last    = i === STATUS_STEPS.length - 1;
              return (
                <View key={step.key} style={styles.stepWrapper}>
                  {/* Connector line above */}
                  {i > 0 && (
                    <View style={[styles.connector, done && styles.connectorDone]} />
                  )}

                  <View style={styles.stepRow}>
                    <View style={[
                      styles.stepCircle,
                      done    && styles.stepCircleDone,
                      current && styles.stepCircleCurrent,
                    ]}>
                      <Text style={{ fontSize: current ? 18 : 14 }}>
                        {done ? (current ? step.emoji : '✓') : '○'}
                      </Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={[styles.stepLabel, done && { color: Colors.text, fontWeight: '600' }]}>
                        {step.label}
                      </Text>
                      {current && order.trackingNote && (
                        <Text style={styles.stepNote}>{order.trackingNote}</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {isCancelled && (
          <View style={styles.cancelledBox}>
            <Text style={{ fontSize: 36 }}>❌</Text>
            <Text style={styles.cancelledText}>This order was cancelled</Text>
            {order.cancellationReason && (
              <Text style={styles.cancelledReason}>{order.cancellationReason}</Text>
            )}
          </View>
        )}

        {/* ── Delivery Address ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery To</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoName}>{order.address?.fullName}</Text>
            <Text style={styles.infoLine}>{order.address?.line1}{order.address?.line2 ? `, ${order.address.line2}` : ''}</Text>
            <Text style={styles.infoLine}>{order.address?.city}, {order.address?.state} {order.address?.pincode}</Text>
          </View>
        </View>

        {/* ── Order Items ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Items Ordered</Text>
          <View style={styles.infoBox}>
            {order.items?.map((item: any, i: number) => (
              <View
                key={item.id}
                style={[styles.itemRow, i < order.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.divider }]}
              >
                <Text style={styles.itemName} numberOfLines={1}>{item.medicine?.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Payment Info ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment</Text>
          <View style={styles.infoBox}>
            <View style={styles.payRow}>
              <Text style={styles.payLabel}>Method</Text>
              <Text style={styles.payValue}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</Text>
            </View>
            <View style={[styles.payRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.payLabel}>Total Paid</Text>
              <Text style={[styles.payValue, { color: Colors.primary, fontWeight: '700' }]}>₹{order.totalAmount}</Text>
            </View>
            {order.savings > 0 && (
              <View style={styles.savedRow}>
                <Text style={styles.savedText}>🎉 You saved ₹{order.savings} with generics on this order!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Re-order button */}
      {order.status === 'DELIVERED' && (
        <View style={styles.stickyBottom}>
          <Button
            title="🔁 Reorder Same Items"
            onPress={() => router.push('/(tabs)/cart')}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  orderHeader:     { backgroundColor: Colors.surface, padding: 20, alignItems: 'center',
                     borderBottomWidth: 1, borderBottomColor: Colors.divider },
  orderId:         { fontSize: 20, fontWeight: '700', color: Colors.text },
  orderDate:       { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  statusPill:      { backgroundColor: Colors.primary + '18', borderRadius: 8,
                     paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  statusText:      { fontSize: 13, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase' },
  tracker:         { padding: 20 },
  stepWrapper:     { paddingLeft: 16 },
  connector:       { width: 2, height: 24, backgroundColor: Colors.border, marginLeft: 14, marginVertical: 2 },
  connectorDone:   { backgroundColor: Colors.primary },
  stepRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepCircle:      { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceOffset,
                     borderWidth: 2, borderColor: Colors.border,
                     justifyContent: 'center', alignItems: 'center' },
  stepCircleDone:  { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  stepCircleCurrent:{ backgroundColor: Colors.primary, borderColor: Colors.primaryHover },
  stepInfo:        { flex: 1, paddingTop: 4 },
  stepLabel:       { fontSize: 14, color: Colors.textMuted },
  stepNote:        { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '500' },
  cancelledBox:    { margin: 20, padding: 20, backgroundColor: Colors.error + '10',
                     borderRadius: 16, alignItems: 'center', gap: 8 },
  cancelledText:   { fontSize: 16, fontWeight: '700', color: Colors.error },
  cancelledReason: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  section:         { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  infoBox:         { backgroundColor: Colors.surface, borderRadius: 14,
                     borderWidth: 1, borderColor: Colors.border, padding: 14 },
  infoName:        { fontSize: 14, fontWeight: '600', color: Colors.text },
  infoLine:        { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  itemRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  itemName:        { flex: 1, fontSize: 13, color: Colors.text },
  itemQty:         { fontSize: 12, color: Colors.textMuted },
  itemPrice:       { fontSize: 13, fontWeight: '600', color: Colors.text },
  payRow:          { flexDirection: 'row', justifyContent: 'space-between',
                     paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  payLabel:        { fontSize: 13, color: Colors.textMuted },
  payValue:        { fontSize: 13, color: Colors.text },
  savedRow:        { paddingTop: 10 },
  savedText:       { fontSize: 13, color: Colors.success, fontWeight: '500', textAlign: 'center' },
  stickyBottom:    { padding: 16, backgroundColor: Colors.surface,
                     borderTopWidth: 1, borderTopColor: Colors.border },
});
