import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { ordersApi } from '@/services/api';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'];

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING:    COLORS.warning,
    CONFIRMED:  COLORS.primary,
    PACKED:     COLORS.primary,
    DISPATCHED: COLORS.primaryLight,
    DELIVERED:  COLORS.success,
    CANCELLED:  COLORS.error,
  };
  return map[status] ?? COLORS.textMuted;
}

export default function OrdersScreen() {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn:  () => ordersApi.list().then((r) => r.data.data ?? []),
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>
      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch}
            tintColor={COLORS.primary} colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/order/${item.id}`)} activeOpacity={0.82}>
            <Card style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '22' }]}>
                  <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.orderMeta}>
                {item.items?.length ?? 0} item{item.items?.length !== 1 ? 's' : ''}
                {' · '}₹{item.totalAmount?.toFixed(2)}
              </Text>

              {/* Progress bar */}
              {item.status !== 'CANCELLED' && (
                <View style={styles.progressRow}>
                  {STATUS_STEPS.map((step, i) => {
                    const reached = STATUS_STEPS.indexOf(item.status) >= i;
                    return (
                      <View key={step} style={styles.progressStep}>
                        <View style={[
                          styles.progressDot,
                          reached && styles.progressDotActive,
                        ]} />
                        {i < STATUS_STEPS.length - 1 && (
                          <View style={[
                            styles.progressLine,
                            reached && STATUS_STEPS.indexOf(item.status) > i && styles.progressLineActive,
                          ]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>Your order history will appear here.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: COLORS.bg },
  heading:           { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, padding: SPACING.xl, paddingBottom: SPACING.md },
  list:              { padding: SPACING.xl, gap: SPACING.sm },
  orderCard:         { gap: SPACING.sm },
  orderTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId:           { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  badge:             { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText:         { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  orderMeta:         { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  progressRow:       { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  progressStep:      { flexDirection: 'row', alignItems: 'center', flex: 1 },
  progressDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary },
  progressLine:      { flex: 1, height: 2, backgroundColor: COLORS.border },
  progressLineActive:{ backgroundColor: COLORS.primary },
  emptyState:        { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyIcon:         { fontSize: 48 },
  emptyTitle:        { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  emptyText:         { fontSize: FONT_SIZE.base, color: COLORS.textMuted },
});
