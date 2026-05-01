import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { prescriptionsApi } from '../../api/prescriptions.api';
import type { RootStackProps } from '../../navigation/types';

type Prescription = { id: string; status: string; imageUrl: string; ocrData?: string };

export default function PrescriptionUploadScreen({ navigation }: RootStackProps<'PrescriptionUpload'>) {
  const [image, setImage]           = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [result, setResult]         = useState<Prescription | null>(null);

  const pick = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission denied', 'Please allow access in Settings.');
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, base64: false, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const upload = async () => {
    if (!image) return;
    setUploading(true);
    try {
      const res = await prescriptionsApi.upload(image);
      setResult(res.data);
      Alert.alert('Uploaded!', 'Your prescription is being reviewed.');
    } catch (err: any) {
      Alert.alert('Upload failed', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 20 }}>
      {/* Source selection */}
      <Text style={styles.title}>Upload Prescription</Text>
      <Text style={styles.subtitle}>Take a photo or choose from gallery</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.sourceBtn} onPress={() => pick(true)} activeOpacity={0.85}>
          <Text style={styles.sourceBtnIcon}>📷</Text>
          <Text style={styles.sourceBtnText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sourceBtn} onPress={() => pick(false)} activeOpacity={0.85}>
          <Text style={styles.sourceBtnIcon}>🖼️</Text>
          <Text style={styles.sourceBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
            onPress={upload}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.uploadBtnText}>Upload prescription</Text>}
          </TouchableOpacity>
        </>
      )}

      {/* OCR result */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Prescription received ✅</Text>
          <Text style={styles.resultStatus}>Status: {result.status}</Text>
          {result.ocrData && (
            <Text style={styles.ocrText}>{result.ocrData}</Text>
          )}
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={styles.orderBtnText}>Go to medicines →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#f7f6f2' },
  title:          { fontSize: 22, fontWeight: '700', color: '#28251d', marginBottom: 6 },
  subtitle:       { fontSize: 14, color: '#7a7974', marginBottom: 24 },
  btnRow:         { flexDirection: 'row', gap: 16, marginBottom: 24 },
  sourceBtn:      { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#dcd9d5' },
  sourceBtnIcon:  { fontSize: 28, marginBottom: 6 },
  sourceBtnText:  { fontSize: 14, fontWeight: '600', color: '#28251d' },
  preview:        { width: '100%', height: 260, borderRadius: 12, marginBottom: 16 },
  uploadBtn:      { backgroundColor: '#01696f', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  uploadBtnText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultCard:     { backgroundColor: '#fff', borderRadius: 12, padding: 18 },
  resultTitle:    { fontSize: 16, fontWeight: '700', color: '#437a22', marginBottom: 6 },
  resultStatus:   { fontSize: 14, color: '#7a7974', marginBottom: 8 },
  ocrText:        { fontSize: 13, color: '#28251d', lineHeight: 20, marginBottom: 16 },
  orderBtn:       { backgroundColor: '#cedcd8', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  orderBtnText:   { color: '#01696f', fontWeight: '700', fontSize: 15 },
});
