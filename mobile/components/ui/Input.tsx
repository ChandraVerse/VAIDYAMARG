import { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '@/constants';

interface InputProps extends TextInputProps {
  label?:       string;
  error?:       string;
  helper?:      string;
  rightIcon?:   React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helper,
  rightIcon,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error  && <Text style={styles.error}>{error}</Text>}
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { gap: SPACING.xs },
  label:        { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.md,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex:      1,
    fontSize:  FONT_SIZE.base,
    color:     COLORS.text,
    paddingVertical: SPACING.sm + 2,
  },
  focused:   { borderColor: COLORS.primary, borderWidth: 1.5 },
  errored:   { borderColor: COLORS.error },
  rightIcon: { paddingLeft: SPACING.sm },
  error:     { fontSize: FONT_SIZE.xs, color: COLORS.error },
  helper:    { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
});
