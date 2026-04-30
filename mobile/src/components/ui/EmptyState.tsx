import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { Colors } from '../../theme/colors';

interface EmptyStateProps {
  emoji:     string;
  title:     string;
  message:   string;
  actionLabel?: string;
  onAction?:    () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji, title, message, actionLabel, onAction,
}) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction && (
      <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.btn} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji:     { fontSize: 56, marginBottom: 16 },
  title:     { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  message:   { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 280, marginBottom: 24 },
  btn:       { minWidth: 160 },
});
