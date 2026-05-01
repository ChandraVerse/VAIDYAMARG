import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { partnersApi } from '@/api/partners.api';

type Item = { id: string; medicineName: string; quantity: number; unitPrice: number; totalPrice: number };
type Address = { name: string; phone: string; street: string; city: string; pincode: string };
type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  address: Address;
  items: Item[];
};

const STATUS_FLOW: Record<string, string | null> = {
  CONFIRMED:  'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED:    'DELIVERED',
  DELIVERED:  null,
  CANCELLED:  null,
  PENDING:    'CONFIRMED',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

export function PartnerOrderDetailScreen() {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params as { orderId: string };

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState(false);

  const load = async () => {
    try {
      const res = await partnersApi.getOrderDetail(orderId);
      setOrder(res.data?.order ?? res.data);
    } catch { Alert.alert('Error', 'Could not load order'); navigation.goBack(); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [orderId]);

  const advance = async () => {
    if (!order) return;
    const next = STATUS_FLOW[order.status];
    if (!next) return;
    Alert.alert(
      'Update status',
      `Move order to ${next}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setActing(true);
            try {
              await partnersApi.updateOrderStatus(orderId, next);
              await load();
            } catch { Alert.alert('Failed', 'Could not update status'); }
            finally { setActing(false); }
          },
        },
      ]
    );
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#0d9488" /></View>
  );
  if (!order) return null;

  const nextStatus = STATUS_FLOW[order.status];

  return (
    <ScrollView style={styles.container}>
      {/* Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.date}>
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[order.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[order.status] }]}>
            {order.status}
          </Text>
        </View>
      </View>

      {/* Delivery address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addrName}>{order.address.name} · {order.address.phone}</Text>
        <Text style={styles.addrText}>
          {order.address.street}, {order.address.city} — {order.address.pincode}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.medicineName}</Text>
              <Text style={styles.itemQty}>×{item.quantity} @ ₹{Number(item.unitPrice).toFixed(2)}</Text>
            </View>
            <Text style={styles.itemTotal}>₹{Number(item.totalPrice).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{Number(order.totalAmount).toFixed(2)}</Text>
        </View>
      </View>

      {/* Advance status */}
      {nextStatus && (
        <TouchableOpacity
          style={[styles.advanceBtn, acting && { opacity: 0.6 }]}
          onPress={advance}
          disabled={acting}
        >
          <Text style={styles.advanceBtnText}>
            {acting ? 'Updating…' : `Mark as ${nextStatus}`}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0fdfa', padding: 20 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back:         { marginBottom: 16 },
  backText:     { color: '#0d9488', fontSize: 14, fontWeight: '600' },
  header:       { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 20 },
  orderId:      { fontSize: 20, fontWeight: '800', color: '#111827' },
  date:         { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  section:      { backgroundColor: '#fff', borderRadius: 14, padding: 16,
                  marginBottom: 14, elevation: 1,
                  shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  addrName:     { fontSize: 14, fontWeight: '700', color: '#111827' },
  addrText:     { fontSize: 13, color: '#6b7280', marginTop: 2 },
  itemRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
                  borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemName:     { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemQty:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  itemTotal:    { fontSize: 14, fontWeight: '700', color: '#0d9488' },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between',
                  marginTop: 10, paddingTop: 10 },
  totalLabel:   { fontSize: 15, fontWeight: '700', color: '#374151' },
  totalValue:   { fontSize: 16, fontWeight: '800', color: '#0f766e' },
  advanceBtn:   { backgroundColor: '#0d9488', borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', marginTop: 8, marginBottom: 32 },
  advanceBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
