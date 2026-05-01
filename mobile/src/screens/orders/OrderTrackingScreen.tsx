import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { ordersApi } from '../../api/orders.api';
import { useSocket } from '../../hooks/useSocket';
import type { RootStackProps } from '../../navigation/types';

type TrackData = {
  order: { id: string; status: string; totalAmount: number; deliveryAddress: string; createdAt: string };
  timeline: { step: string; label: string; done: boolean }[];
};

const STEP_ICON: Record<string, string> = {
  PENDING: '📝', CONFIRMED: '✅', PROCESSING: '📦', DISPATCHED: '🚚', DELIVERED: '🎉',
};

export default function OrderTrackingScreen({ route }: RootStackProps<'OrderTracking'>) {
  const { orderId }               = route.params;
  const [data, setData]           = useState<TrackData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (quiet = false) => {
    !quiet && setLoading(true);
    try {
      const res = await ordersApi.track(orderId);
      setData(res.data);
    } catch {
      Alert.alert('Error', 'Could not load tracking info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Real-time socket — refresh when status changes for this order
  useSocket('order_updated', (payload: { orderId: string }) => {
    if (payload.orderId === orderId) load(true);
  });

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#01696f" />;
  if (!data)   return null;

  const { order, timeline } = data;

  return (
    <ScrollView
      style={styles.root}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
    >
      {/* Order summary */}
      <View style={styles.card}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.meta}>₹{Number(order.totalAmount).toFixed(2)} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</Text>
        <Text style={styles.address}>{order.deliveryAddress}</Text>
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tracking</Text>
        {timeline.map((step, i) => (
          <View key={step.step} style={styles.timelineRow}>
            <View style={styles.iconCol}>
              <View style={[styles.dot, step.done && styles.dotDone]}>
                <Text style={styles.dotIcon}>{step.done ? STEP_ICON[step.step] ?? '✓' : ''}</Text>
              </View>
              {i < timeline.length - 1 && (
                <View style={[styles.line, step.done && styles.lineDone]} />
              )}
            </View>
            <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#f7f6f2' },
  card:           { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 18, marginBottom: 0, marginTop: 16 },
  orderId:        { fontSize: 18, fontWeight: '700', color: '#28251d', marginBottom: 4 },
  meta:           { fontSize: 13, color: '#7a7974', marginBottom: 6 },
  address:        { fontSize: 13, color: '#7a7974' },
  sectionTitle:   { fontSize: 15, fontWeight: '600', color: '#28251d', marginBottom: 16 },
  timelineRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  iconCol:        { alignItems: 'center', width: 36 },
  dot:            { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f0ec', borderWidth: 2, borderColor: '#dcd9d5', justifyContent: 'center', alignItems: 'center' },
  dotDone:        { backgroundColor: '#cedcd8', borderColor: '#01696f' },
  dotIcon:        { fontSize: 12 },
  line:           { width: 2, height: 28, backgroundColor: '#dcd9d5', marginVertical: 2 },
  lineDone:       { backgroundColor: '#01696f' },
  stepLabel:      { fontSize: 14, color: '#bab9b4', paddingTop: 4, paddingLeft: 10, paddingBottom: 28 },
  stepLabelDone:  { color: '#28251d', fontWeight: '600' },
});
