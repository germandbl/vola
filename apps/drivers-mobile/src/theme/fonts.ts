import {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import { typography, type TypographyVariant } from "@vola/shared";

export const OUTFIT_FONTS = {
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
};

type FontWeight = (typeof typography)[TypographyVariant]["fontWeight"];

// En React Native cada peso de Outfit es una familia distinta; fontWeight solo no cambia el grosor.
const FONT_FAMILY_BY_WEIGHT: Record<FontWeight, keyof typeof OUTFIT_FONTS> = {
  "400": "Outfit_400Regular",
  "600": "Outfit_600SemiBold",
  "700": "Outfit_700Bold",
  "800": "Outfit_800ExtraBold",
};

export function getTextStyle(variant: TypographyVariant) {
  const { fontSize, lineHeight, fontWeight } = typography[variant];
  return { fontSize, lineHeight, fontFamily: FONT_FAMILY_BY_WEIGHT[fontWeight] };
}
