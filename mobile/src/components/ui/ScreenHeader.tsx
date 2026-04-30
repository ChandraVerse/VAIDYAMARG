import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme/colors';

interface ScreenHeaderProps {
  title:       string;
  subtitle?:   string;
  showBack?:   boolean;
  rightElement?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title, subtitle, showBack = false, rightElement,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
               paddingTop: (StatusBar.currentHeight || 44) + 8,
               paddingHorizontal: 20, paddingBottom: 16,
               backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  left:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:  { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surfaceOffset,
               justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.text },
  title:    { fontSize: 20, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
});
