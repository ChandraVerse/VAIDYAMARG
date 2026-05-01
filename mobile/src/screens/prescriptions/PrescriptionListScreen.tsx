import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { prescriptionsApi } from '../../api/prescriptions.api';
import type { RootStackProps } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PrescriptionStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'OCR_PROCESSING'
  | 'OCR_COMPLETE';

type Prescription = {
  id:              string;
  status:          PrescriptionStatus;
  fileName:        string;
  fileType:        string;
  createdAt:       string;
  verifiedAt:      string | null;
  ocrResult:       string | null;
  rejectionReason: string | null;
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PrescriptionStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  PENDING:        { label: 'Pending Review', bg: '#fff3cd', text: '#7a5c00', icon: '⏳' },
  VERIFIED:       { label: 'Verified',       bg: '#d4dfcc', text: '#2e5c10', icon: '✅' },
  REJECTED:       { label: 'Rejected',       bg: '#e0ced7', text: '#7d1e5e', icon: '❌' },
  OCR_PROCESSING: { label: 'Processing OCR', bg: '#c6d8e4', text: '#0b3751', icon: '🔍' },
  OCR_COMPLETE:   { label: 'OCR Done',       bg: '#cedcd8', text: '#01696f', icon: '📋' },
};

const fallbackStatus: typeof STATUS_CONFIG['PENDING'] = {
  label: 'Unknown', bg: '#f3f0ec', text: '#7a7974', icon: '❓',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fileIcon(fileType: string): string {
  if (fileType.includes('pdf'))  return '📄';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PrescriptionListScreen({ navigation }: RootStackProps<'PrescriptionList'>) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async (quiet = false) => {
    !quiet && setLoading(true);
    try {
      const res = await prescriptionsApi.myList();
      // API returns { success, data: [...], total }
      const list = res.data?.data ?? res.data ?? [];
      setPrescriptions(Array.isArray(list) ? list : []);
    } catch {
      Alert.alert('Error', 'Could not load prescriptions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => load());
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  // ─── Render item ─────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Prescription }) => {
    const cfg = STATUS_CONFIG[item.status] ?? fallbackStatus;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('PrescriptionDetail', { prescriptionId: item.id })}
      >
        {/* Left icon */}
        <View style={styles.fileIcon}>
          <Text style={styles.fileIconText}>{fileIcon(item.fileType)}</Text>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
          <Text style={styles.date}>Uploaded {formatDate(item.createdAt)}</Text>
          {item.verifiedAt && (
            <Text style={styles.verifiedDate}>
              Verified {formatDate(item.verifiedAt)}
            </Text>
          )}
          {item.rejectionReason && (
            <Text style={styles.rejectionReason} numberOfLines={2}>
              Reason: {item.rejectionReason}
            </Text>
          )}
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={styles.badgeIcon}>{cfg.icon}</Text>
          <Text style={[styles.badgeLabel, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color="#01696f" size="large" />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <FlatList
        data={prescriptions}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#01696f"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No prescriptions yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload a prescription to get medicines that require a doctor's note
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PrescriptionUpload')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnText}>Upload prescription</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB — always visible when list has items */}
      {prescriptions.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('PrescriptionUpload')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Upload new</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#f7f6f2' },
  list:           { padding: 16, paddingBottom: 96 },

  card:           { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'flex-start', gap: 12 },

  fileIcon:       { width: 44, height: 44, borderRadius: 10, backgroundColor: '#f3f0ec', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  fileIconText:   { fontSize: 22 },

  cardBody:       { flex: 1 },
  fileName:       { fontSize: 14, fontWeight: '600', color: '#28251d', marginBottom: 3 },
  date:           { fontSize: 12, color: '#7a7974' },
  verifiedDate:   { fontSize: 12, color: '#437a22', marginTop: 2 },
  rejectionReason:{ fontSize: 12, color: '#a12c7b', marginTop: 4, lineHeight: 16 },

  badge:          { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, alignItems: 'center', flexShrink: 0, minWidth: 72 },
  badgeIcon:      { fontSize: 14, marginBottom: 2 },
  badgeLabel:     { fontSize: 10, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },

  // Empty state
  empty:          { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: '#28251d', marginBottom: 8 },
  emptySubtitle:  { fontSize: 14, color: '#7a7974', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn:       { backgroundColor: '#01696f', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28 },
  emptyBtnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },

  // FAB
  fab:            { position: 'absolute', bottom: 24, right: 20, backgroundColor: '#01696f', borderRadius: 28, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, gap: 6, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  fabIcon:        { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  fabText:        { color: '#fff', fontWeight: '700', fontSize: 14 },
});
