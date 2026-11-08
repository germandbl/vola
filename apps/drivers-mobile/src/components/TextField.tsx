import { colors, radius, spacing } from "@vola/shared";
import { useState, type ReactNode } from "react";
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
  // Un botón dentro del campo, a la derecha (por ejemplo, mostrar la contraseña).
  trailing?: ReactNode;
}

export function TextField({ label, error, trailing, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = getBorderColor(Boolean(error), isFocused);

  return (
    <View style={styles.field}>
      <AppText variant="pequeno">{label}</AppText>
      <View
        style={[
          styles.box,
          inputProps.multiline && styles.multilineBox,
          { borderColor, borderWidth: isFocused ? FOCUSED_BORDER_WIDTH : BORDER_WIDTH },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.tintaSuave}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={label}
          aria-invalid={Boolean(error)}
          style={[styles.input, inputProps.multiline && styles.multilineInput]}
          {...inputProps}
        />
        {trailing}
      </View>
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
  box: {
    height: FIELD_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    borderRadius: radius.sm,
    backgroundColor: colors.blanco,
  },
  multilineBox: {
    height: undefined,
    minHeight: MULTILINE_MIN_HEIGHT,
    alignItems: "flex-start",
    paddingVertical: spacing[2],
  },
  input: { ...getTextStyle("cuerpo"), flex: 1, height: "100%", color: colors.tinta },
  multilineInput: { textAlignVertical: "top" },
});
