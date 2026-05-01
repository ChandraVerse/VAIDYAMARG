import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { prescriptionsApi } from '../../api/prescriptions.api';
import type { RootStackProps } from '../../navigation/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type PrescriptionDetail = {
  id:              string;
  status:          string;
  fileName:        string;
  fileType:        string;
  fileSize:        number;
  imageUrl:        string;
  createdAt:       string;
  verifiedAt:      string | null;
  rejectionReason: string | null;
  pharmacistNotes: string | null;
  ocrResult:       string | null;
  ocrProcessedAt:  string | null;
};

type OcrResult = {
  medicines?:    Array<{ name: string; dosage?: string; quantity?: string }>;
  doctor_name?:  string;
  patient_name?: string;
  confidence?:   number;
};

// ─── Status config (same palette as list screen) ──────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  PENDING:        { label: 'Pending Review', bg: '#fff3cd', color: '#7a5c00', icon: '⏳' },
  VERIFIED:       { label: 'Verified',       bg: '#d4dfcc', color: '#2e5c10', icon: '✅' },
  REJECTED:       { label: 'Rejected',       bg: '#e0ced7', color: '#7d1e5e', icon: '❌' },
  OCR_PROCESSING: { label: 'Processing OCR', bg: '#c6d8e4', color: '#0b3751', icon: '🔍' },
  OCR_COMPLETE:   { label: 'OCR Complete',   bg: '#cedcd8', color: '#01696f', icon: '📋' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PrescriptionDetailScreen({
  route,
  navigation,
}: RootStackProps<'PrescriptionDetail'>) {
  const { prescriptionId } = route.params;

  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [triggering, setTriggering]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await prescriptionsApi.detail(prescriptionId);
        setPrescription(res.data?.data ?? res.data);
      } catch {
        Alert.alert('Error', 'Could not load prescription details.', [
          { text: 'Go back', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [prescriptionId]);

  const handleTriggerOcr = async () => {
    if (!prescription) return;
    setTriggering(true);
    try {
      const res = await prescriptionsApi.triggerOcr(prescriptionId);
      const updated = res.data;
      Alert.alert(
        updated.success ? 'OCR complete ✅' : 'OCR unavailable',
        updated.message,
      );
      if (updated.success) {
        // Refresh detail
        const detail = await prescriptionsApi.detail(prescriptionId);
        setPrescription(detail.data?.data ?? detail.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'OCR failed.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color="#01696f" size="large" />;
  }

  if (!prescription) return null;

  const cfg = STATUS_CONFIG[prescription.status] ?? {
    label: prescription.status, bg: '#f3f0ec', color: '#7a7974', icon: '❓',
  };

  // Parse OCR JSON safely
  let ocr: OcrResult | null = null;
  if (prescription.ocrResult) {
    try { ocr = JSON.parse(prescription.ocrResult); } catch { /* ignore */ }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* ── Status banner ────────────────────────────────────────────── */}
      <View style={[styles.statusBanner, { backgroundColor: cfg.bg }]}>
        <Text style={styles.statusIcon}>{cfg.icon}</Text>
        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      {/* ── Prescription image ────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => prescription.imageUrl && Linking.openURL(prescription.imageUrl)}
      >
        <Image
          source={{ uri: prescription.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.imageHint}>Tap to open full size ↗</Text>
      </TouchableOpacity>

      {/* ── Metadata ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Row label="File"        value={prescription.fileName} />
        <Row label="Type"        value={prescription.fileType} />
        <Row label="Size"        value={formatFileSize(prescription.fileSize)} />
        <Row label="Uploaded"    value={formatDate(prescription.createdAt)} />
        {prescription.verifiedAt && (
          <Row label="Verified" value={formatDate(prescription.verifiedAt)} />
        )}
        {prescription.ocrProcessedAt && (
          <Row label="OCR processed" value={formatDate(prescription.ocrProcessedAt)} />
        )}
      </View>

      {/* ── Rejection reason ─────────────────────────────────────────── */}
      {prescription.rejectionReason && (
        <View style={styles.rejectionBox}>
          <Text style={styles.rejectionTitle}>Rejection reason</Text>
          <Text style={styles.rejectionText}>{prescription.rejectionReason}</Text>
        </View>
      )}

      {/* ── Pharmacist notes ─────────────────────────────────────────── */}
      {prescription.pharmacistNotes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Pharmacist notes</Text>
          <Text style={styles.notesText}>{prescription.pharmacistNotes}</Text>
        </View>
      )}

      {/* ── OCR results ──────────────────────────────────────────────── */}
      {ocr && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted medicines</Text>
          {ocr.doctor_name && (
            <Text style={styles.ocrMeta}>Doctor: {ocr.doctor_name}</Text>
          )}
          {ocr.patient_name && (
            <Text style={styles.ocrMeta}>Patient: {ocr.patient_name}</Text>
          )}
          {ocr.confidence !== undefined && (
            <Text style={styles.ocrMeta}>
              Confidence: {Math.round(ocr.confidence * 100)}%
            </Text>
          )}
          {(ocr.medicines ?? []).length === 0 ? (
            <Text style={styles.ocrEmpty}>No medicines extracted</Text>
          ) : (
            ocr.medicines!.map((m, i) => (
              <View key={i} style={styles.ocrMedRow}>
                <Text style={styles.ocrMedName}>{m.name}</Text>
                {(m.dosage || m.quantity) && (
                  <Text style={styles.ocrMedMeta}>
                    {[m.dosage, m.quantity].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* ── OCR trigger ──────────────────────────────────────────────── */}
      {['PENDING', 'VERIFIED'].includes(prescription.status) && (
        <TouchableOpacity
          style={[styles.ocrBtn, triggering && { opacity: 0.6 }]}
          onPress={handleTriggerOcr}
          disabled={triggering}
          activeOpacity={0.85}
        >
          {triggering
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ocrBtnText}>🔍 Run OCR extraction</Text>
          }
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#f7f6f2' },
  content:          { padding: 16 },

  statusBanner:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginBottom: 16 },
  statusIcon:       { fontSize: 22 },
  statusLabel:      { fontSize: 15, fontWeight: '700' },

  image:            { width: '100%', height: 280, borderRadius: 12, backgroundColor: '#f3f0ec', marginBottom: 4 },
  imageHint:        { fontSize: 12, color: '#7a7974', textAlign: 'center', marginBottom: 20 },

  section:          { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle:     { fontSize: 13, fontWeight: '700', color: '#7a7974', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  row:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f3f0ec' },
  rowLabel:         { fontSize: 13, color: '#7a7974', flex: 1 },
  rowValue:         { fontSize: 13, fontWeight: '600', color: '#28251d', flex: 2, textAlign: 'right' },

  rejectionBox:     { backgroundColor: '#e0ced7', borderRadius: 12, padding: 14, marginBottom: 12 },
  rejectionTitle:   { fontSize: 12, fontWeight: '700', color: '#7d1e5e', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  rejectionText:    { fontSize: 14, color: '#561740', lineHeight: 20 },

  notesBox:         { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#dcd9d5' },
  notesTitle:       { fontSize: 12, fontWeight: '700', color: '#7a7974', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  notesText:        { fontSize: 14, color: '#28251d', lineHeight: 20 },

  ocrMeta:          { fontSize: 13, color: '#7a7974', marginBottom: 6 },
  ocrEmpty:         { fontSize: 13, color: '#bab9b4', fontStyle: 'italic' },
  ocrMedRow:        { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f0ec' },
  ocrMedName:       { fontSize: 14, fontWeight: '600', color: '#28251d' },
  ocrMedMeta:       { fontSize: 12, color: '#7a7974', marginTop: 2 },

  ocrBtn:           { backgroundColor: '#0c4e54', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  ocrBtnText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
});
