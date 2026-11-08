import { colors, radius, spacing } from "@vola/shared";
import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { getTextStyle } from "@/theme/fonts";
import { AppText } from "./AppText";

const FIELD_HEIGHT = 48;
const MULTILINE_MIN_HEIGHT = 96;
const BORDER_WIDTH = 1;
const FOCUSED_BORDER_WIDTH = 2;

function getBorderColor(hasError: boolean, isFocused: boolean): string {
  if (hasError) return colors.error;
  if (isFocused) return colors.accion;
  return colors.borde;
}

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = getBorderColor(Boolean(error), isFocused);

  return (
    <View style={styles.field}>
      <AppText variant="pequeno">{label}</AppText>
      <TextInput
        placeholderTextColor={colors.tintaSuave}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={label}
        aria-invalid={Boolean(error)}
        style={[
          styles.input,
          inputProps.multiline && styles.multilineInput,
          { borderColor, borderWidth: isFocused ? FOCUSED_BORDER_WIDTH : BORDER_WIDTH },
        ]}
        {...inputProps}
      />
      {error && (
        <AppText variant="pequeno" tone="error">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing[1] },
  input: {
    ...getTextStyle("cuerpo"),
    height: FIELD_HEIGHT,
    paddingHorizontal: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.blanco,
    color: colors.tinta,
  },
  multilineInput: {
    height: undefined,
    minHeight: MULTILINE_MIN_HEIGHT,
    paddingVertical: spacing[2],
    textAlignVertical: "top",
  },
});
