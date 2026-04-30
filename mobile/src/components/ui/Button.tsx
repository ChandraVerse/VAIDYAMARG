import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, style, textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base:        { borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fullWidth:   { width: '100%' },
  disabled:    { opacity: 0.5 },

  primary:     { backgroundColor: Colors.primary },
  secondary:   { backgroundColor: Colors.primaryLight },
  ghost:       { backgroundColor: Colors.transparent, borderWidth: 1.5, borderColor: Colors.primary },
  danger:      { backgroundColor: Colors.error },

  size_sm:     { paddingVertical: 8,  paddingHorizontal: 16 },
  size_md:     { paddingVertical: 14, paddingHorizontal: 24 },
  size_lg:     { paddingVertical: 18, paddingHorizontal: 32 },

  text:           { fontWeight: '600' },
  text_primary:   { color: Colors.white },
  text_secondary: { color: Colors.primaryHover },
  text_ghost:     { color: Colors.primary },
  text_danger:    { color: Colors.white },

  textSize_sm:    { fontSize: 13 },
  textSize_md:    { fontSize: 15 },
  textSize_lg:    { fontSize: 17 },
});
