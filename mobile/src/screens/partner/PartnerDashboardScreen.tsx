import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { partnersApi } from '@/api/partners.api';
import { usePartnerStore } from '@/store/partner.store';

type Stats = {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalEarnings: number;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string; phone: string };
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

export function PartnerDashboardScreen() {
  const navigation        = useNavigation<any>();
  const { setProfile }    = usePartnerStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dashRes, profileRes] = await Promise.all([
        partnersApi.dashboard(),
        partnersApi.getProfile(),
      ]);
      setStats(dashRes.data?.stats ?? dashRes.data);
      setOrders(dashRes.data?.recentOrders ?? []);
      setProfile(profileRes.data?.pharmacy ?? profileRes.data);
    } catch { /* silently fail — show stale data */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0d9488" />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.sub}>Today’s overview</Text>

      {/* KPI cards */}
      <View style={styles.kpiRow}>
        {[
          { label: "Today's Orders",  value: stats?.todayOrders   ?? 0, color: '#0d9488' },
          { label: "Today's Revenue", value: `₹${stats?.todayRevenue?.toFixed(0) ?? 0}`, color: '#0d9488' },
          { label: 'Pending',         value: stats?.pendingOrders  ?? 0, color: '#f59e0b' },
          { label: 'Total Earned',    value: `₹${stats?.totalEarnings?.toFixed(0) ?? 0}`, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <View key={label} style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color }]}>{value}</Text>
            <Text style={styles.kpiLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Incoming orders */}
      <Text style={styles.sectionTitle}>Incoming Orders</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No orders yet today 🎉</Text>
        </View>
      ) : (
        orders.map((o) => (
          <TouchableOpacity
            key={o.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('PartnerOrderDetail', { orderId: o.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.orderName}>{o.user.name}</Text>
              <Text style={styles.orderPhone}>{o.user.phone}</Text>
              <Text style={styles.orderDate}>
                {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.orderAmount}>₹{Number(o.totalAmount).toFixed(2)}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[o.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[o.status] }]}>{o.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0fdfa', padding: 20 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading:      { fontSize: 26, fontWeight: '800', color: '#0f766e', marginTop: 16 },
  sub:          { fontSize: 13, color: '#6b7280', marginBottom: 20 },
  kpiRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  kpiCard:      { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14,
                  padding: 16, elevation: 1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  kpiValue:     { fontSize: 22, fontWeight: '800' },
  kpiLabel:     { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  emptyBox:     { alignItems: 'center', padding: 32, backgroundColor: '#fff',
                  borderRadius: 14, marginBottom: 16 },
  emptyText:    { color: '#9ca3af', fontSize: 15 },
  orderCard:    { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
                  padding: 16, marginBottom: 10, elevation: 1,
                  shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  orderName:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  orderPhone:   { fontSize: 12, color: '#6b7280', marginTop: 2 },
  orderDate:    { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  orderAmount:  { fontSize: 16, fontWeight: '800', color: '#0d9488' },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText:    { fontSize: 10, fontWeight: '700' },
});
