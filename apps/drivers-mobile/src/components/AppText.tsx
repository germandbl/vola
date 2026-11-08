import { colors, type TypographyVariant } from "@vola/shared";
import { Text, type TextProps } from "react-native";
import { getTextStyle } from "@/theme/fonts";

type AppTextTone = "tinta" | "tintaSuave" | "accion" | "error" | "blanco";

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: AppTextTone;
}

export function AppText({ variant = "cuerpo", tone = "tinta", style, ...props }: AppTextProps) {
  return <Text style={[getTextStyle(variant), { color: colors[tone] }, style]} {...props} />;
}
