import Feather from "@expo/vector-icons/Feather";
import { colors } from "@vola/shared";
import { useState } from "react";
import { Pressable, type TextInputProps } from "react-native";
import { TextField } from "./TextField";

const ICON_SIZE = 20;

interface PasswordFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      secureTextEntry={!isVisible}
      autoCapitalize="none"
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          hitSlop={8}
          onPress={() => setIsVisible((current) => !current)}
        >
          <Feather name={isVisible ? "eye-off" : "eye"} size={ICON_SIZE} color={colors.tintaSuave} />
        </Pressable>
      }
    />
  );
}
