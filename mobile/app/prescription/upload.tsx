import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Button, Card } from '@/components/ui';
import { prescriptionsApi } from '@/services/api';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

export default function PrescriptionUploadScreen() {
  const [image, setImage]     = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.85,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        uri:  asset.uri,
        name: asset.fileName ?? `prescription_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Camera permission denied' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality:    0.85,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        uri:  asset.uri,
        name: `prescription_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri:  image.uri,
        name: image.name,
        type: image.type,
      } as any);

      await prescriptionsApi.upload(formData);
      Toast.show({ type: 'success', text1: 'Prescription uploaded', text2: 'Our pharmacist will verify it shortly.' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Upload Prescription</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Instructions */}
        <Card style={styles.instructCard}>
          <Text style={styles.instructTitle}>Before uploading</Text>
          {[
            'Ensure the prescription is clear and fully visible.',
            'Include the doctor name, date, and patient details.',
            'Accepted formats: JPG, PNG (max 5 MB).',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Text style={styles.tipDot}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* Image preview */}
        {image ? (
          <View style={styles.preview}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity style={styles.clearBtn} onPress={() => setImage(null)}>
              <Text style={styles.clearText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerArea}>
            <TouchableOpacity style={styles.pickerBtn} onPress={pickFromCamera}>
              <Text style={styles.pickerIcon}>📷</Text>
              <Text style={styles.pickerLabel}>Take a photo</Text>
            </TouchableOpacity>
            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity style={styles.pickerBtn} onPress={pickFromGallery}>
              <Text style={styles.pickerIcon}>🖼️</Text>
              <Text style={styles.pickerLabel}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {image && (
          <Button
            label={uploading ? 'Uploading…' : 'Submit Prescription'}
            onPress={handleUpload}
            loading={uploading}
            disabled={uploading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />
        )}

        <Text style={styles.privacy}>
          Your prescription is stored securely and shared only with our licensed pharmacists.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.xl },
  backText:      { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '500' },
  topBarTitle:   { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  scroll:        { padding: SPACING.xl, gap: SPACING.lg },
  instructCard:  { gap: SPACING.sm },
  instructTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  tipRow:        { flexDirection: 'row', gap: SPACING.sm },
  tipDot:        { fontSize: FONT_SIZE.base, color: COLORS.primary, marginTop: 1 },
  tipText:       { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, flex: 1, lineHeight: 20 },
  preview:       { alignItems: 'center', gap: SPACING.md },
  previewImage:  { width: '100%', height: 280, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface },
  clearBtn:      { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  clearText:     { fontSize: FONT_SIZE.sm, color: COLORS.error, fontWeight: '500' },
  pickerArea:    { gap: SPACING.md },
  pickerBtn: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    borderStyle:     'dashed',
    padding:         SPACING.xxl,
    alignItems:      'center',
    gap:             SPACING.sm,
  },
  pickerIcon:    { fontSize: 36 },
  pickerLabel:   { fontSize: FONT_SIZE.base, fontWeight: '500', color: COLORS.text },
  orDivider:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dividerLine:   { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText:        { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  submitBtn:     { marginTop: SPACING.xs },
  privacy:       { fontSize: FONT_SIZE.xs, color: COLORS.textFaint, textAlign: 'center', lineHeight: 18 },
});
