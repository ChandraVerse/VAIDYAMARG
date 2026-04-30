import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
  ActivityIndicator, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Colors } from '../../src/theme/colors';
import { prescriptionsApi } from '../../src/api/prescriptions.api';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  PENDING:  { label: 'Under Review', color: Colors.warning,  emoji: '⏳' },
  VERIFIED: { label: 'Verified',     color: Colors.success,  emoji: '✅' },
  REJECTED: { label: 'Rejected',     color: Colors.error,    emoji: '❌' },
};

export default function PrescriptionScreen() {
  const queryClient = useQueryClient();
  const [preview,    setPreview]    = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['my-prescriptions'],
    queryFn:  () => prescriptionsApi.myList().then((r) => r.data.data),
  });

  // ── Pick image from gallery ──────────────────────────────────
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access in Settings to upload prescriptions.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled) setPreview(result.assets[0].uri);
  };

  // ── Capture with camera ───────────────────────────────────
  const captureWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled) setPreview(result.assets[0].uri);
  };

  // ── Upload prescription ───────────────────────────────────
  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = preview.split('/').pop() || 'prescription.jpg';
      const ext      = filename.split('.').pop()?.toLowerCase();
      const type     = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('file', { uri: preview, name: filename, type } as any);

      await prescriptionsApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['my-prescriptions'] });
      setPreview(null);
      Toast.show({
        type: 'success',
        text1: '💊 Prescription uploaded!',
        text2: 'A pharmacist will verify it within 30 minutes.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prescriptions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Upload Card ──────────────────────────────────────── */}
        <View style={styles.uploadCard}>
          {preview ? (
            // Preview mode
            <View style={styles.previewContainer}>
              <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setPreview(null)}
                >
                  <Text style={styles.retakeBtnText}>↺ Retake</Text>
                </TouchableOpacity>
                <Button
                  title={uploading ? 'Uploading…' : 'Upload Prescription'}
                  onPress={handleUpload}
                  loading={uploading}
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            // Pick mode
            <View style={styles.pickContainer}>
              <Text style={styles.pickEmoji}>📝</Text>
              <Text style={styles.pickTitle}>Upload your prescription</Text>
              <Text style={styles.pickSub}>
                Get it verified by a licensed pharmacist within 30 minutes
              </Text>
              <View style={styles.pickButtons}>
                <TouchableOpacity style={styles.pickBtn} onPress={captureWithCamera} activeOpacity={0.8}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>📷</Text>
                  <Text style={styles.pickBtnLabel}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery} activeOpacity={0.8}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>🖼️</Text>
                  <Text style={styles.pickBtnLabel}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pickHint}>
                🔒 Prescription images are stored securely and only shared with verified pharmacists
              </Text>
            </View>
          )}
        </View>

        {/* ── Tips ─────────────────────────────────────────────── */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for a valid prescription</Text>
          {[
            'Ensure the image is clear and fully visible',
            'Include doctor name, date, and stamp',
            'Prescription must be less than 6 months old',
            'All text should be legible — no blurry photos',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Past Prescriptions ────────────────────────────────── */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>My Prescriptions</Text>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : prescriptions?.length === 0 ? (
            <Text style={styles.emptyText}>No prescriptions uploaded yet.</Text>
          ) : (
            prescriptions?.map((rx: any) => {
              const cfg = STATUS_CONFIG[rx.status] || STATUS_CONFIG.PENDING;
              return (
                <View key={rx.id} style={styles.rxCard}>
                  <View style={[styles.rxStatusDot, { backgroundColor: cfg.color }]} />
                  <View style={styles.rxInfo}>
                    <Text style={styles.rxDate}>
                      {new Date(rx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </Text>
                    {rx.rejectionReason && (
                      <Text style={styles.rxReason}>{rx.rejectionReason}</Text>
                    )}
                  </View>
                  <View style={[styles.rxBadge, { backgroundColor: cfg.color + '20' }]}>
                    <Text style={{ fontSize: 12 }}>{cfg.emoji}</Text>
                    <Text style={[styles.rxBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  header:           { paddingTop: (StatusBar.currentHeight || 44) + 12,
                      paddingHorizontal: 20, paddingBottom: 16,
                      backgroundColor: Colors.surface,
                      borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle:      { fontSize: 20, fontWeight: '700', color: Colors.text },
  uploadCard:       { margin: 16, backgroundColor: Colors.surface, borderRadius: 20,
                      borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  pickContainer:    { padding: 24, alignItems: 'center' },
  pickEmoji:        { fontSize: 52, marginBottom: 12 },
  pickTitle:        { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  pickSub:          { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  pickButtons:      { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pickBtn:          { flex: 1, backgroundColor: Colors.surfaceOffset, borderRadius: 16,
                      borderWidth: 1, borderColor: Colors.border,
                      padding: 18, alignItems: 'center' },
  pickBtnLabel:     { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  pickHint:         { fontSize: 11, color: Colors.textFaint, textAlign: 'center', lineHeight: 18 },
  previewContainer: { },
  previewImage:     { width: '100%', height: 260 },
  previewActions:   { flexDirection: 'row', gap: 10, padding: 12, alignItems: 'center' },
  retakeBtn:        { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
                      borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceOffset },
  retakeBtnText:    { fontSize: 13, color: Colors.text, fontWeight: '600' },
  tipsCard:         { marginHorizontal: 16, marginBottom: 16, backgroundColor: Colors.primary + '0e',
                      borderRadius: 16, borderWidth: 1, borderColor: Colors.primaryLight, padding: 16 },
  tipsTitle:        { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 10 },
  tipRow:           { flexDirection: 'row', gap: 6, marginBottom: 6 },
  tipDot:           { fontSize: 14, color: Colors.primary },
  tipText:          { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 20 },
  listSection:      { paddingHorizontal: 16 },
  listTitle:        { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  emptyText:        { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  rxCard:           { flexDirection: 'row', alignItems: 'center', gap: 12,
                      backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.border,
                      padding: 14, marginBottom: 10 },
  rxStatusDot:      { width: 10, height: 10, borderRadius: 5 },
  rxInfo:           { flex: 1 },
  rxDate:           { fontSize: 14, fontWeight: '600', color: Colors.text },
  rxReason:         { fontSize: 12, color: Colors.error, marginTop: 2 },
  rxBadge:          { flexDirection: 'row', alignItems: 'center', gap: 4,
                      borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  rxBadgeText:      { fontSize: 11, fontWeight: '700' },
});
