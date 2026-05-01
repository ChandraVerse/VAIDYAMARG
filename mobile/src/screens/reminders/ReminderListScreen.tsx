import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Switch, RefreshControl,
} from 'react-native';
import { remindersApi } from '../../api/reminders.api';
import type { RootStackProps } from '../../navigation/types';

type Reminder = {
  id: string;
  medicineName: string;
  reminderTime: string;
  frequency: string;
  isActive: boolean;
};

export default function ReminderListScreen(_: RootStackProps<'ReminderList'>) {
  const [reminders, setReminders]   = useState<Reminder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (quiet = false) => {
    !quiet && setLoading(true);
    try {
      const res = await remindersApi.getAll();
      setReminders(res.data?.reminders ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, current: boolean) => {
    try {
      await remindersApi.update(id, { isActive: !current });
      setReminders((prev) =>
        prev.map((r) => r.id === id ? { ...r, isActive: !current } : r),
      );
    } catch {
      Alert.alert('Error', 'Could not update reminder');
    }
  };

  const remove = async (id: string, name: string) => {
    Alert.alert('Delete reminder', `Remove reminder for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await remindersApi.remove(id);
            setReminders((prev) => prev.filter((r) => r.id !== id));
          } catch {
            Alert.alert('Error', 'Could not delete reminder');
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#01696f" />;

  return (
    <View style={styles.root}>
      <FlatList
        data={reminders}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptySubtitle}>Reminders are auto-set after delivery of chronic medicines</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.medicineName}</Text>
              <Text style={styles.meta}>{item.frequency} · {item.reminderTime}</Text>
            </View>
            <Switch
              value={item.isActive}
              onValueChange={() => toggle(item.id, item.isActive)}
              trackColor={{ true: '#01696f' }}
              thumbColor="#fff"
            />
            <TouchableOpacity onPress={() => remove(item.id, item.medicineName)} style={styles.del}>
              <Text style={styles.delText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f7f6f2' },
  empty:        { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon:    { fontSize: 40, marginBottom: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: '#28251d', marginBottom: 6 },
  emptySubtitle:{ fontSize: 14, color: '#7a7974', textAlign: 'center' },
  card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', gap: 12 },
  name:         { fontSize: 15, fontWeight: '600', color: '#28251d', marginBottom: 3 },
  meta:         { fontSize: 12, color: '#7a7974' },
  del:          { padding: 6 },
  delText:      { fontSize: 18 },
});
