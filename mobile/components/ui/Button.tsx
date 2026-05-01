import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '@/constants';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
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
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:    RADIUS.md,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  fullWidth:    { width: '100%' },
  disabled:     { opacity: 0.5 },

  // Variants
  primary:   { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.primaryHighlight, borderWidth: 1, borderColor: COLORS.primary },
  ghost:     { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  danger:    { backgroundColor: COLORS.error },

  // Sizes
  size_sm: { paddingVertical: SPACING.xs,  paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.xl },
  size_lg: { paddingVertical: SPACING.md,  paddingHorizontal: SPACING.xxl },

  // Labels
  label:          { fontWeight: '600' },
  label_primary:  { color: COLORS.white },
  label_secondary:{ color: COLORS.primary },
  label_ghost:    { color: COLORS.text },
  label_danger:   { color: COLORS.white },

  // Label sizes
  labelSize_sm: { fontSize: FONT_SIZE.xs },
  labelSize_md: { fontSize: FONT_SIZE.sm },
  labelSize_lg: { fontSize: FONT_SIZE.base },
});
