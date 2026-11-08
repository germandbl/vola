// Tokens de DESIGN.md para clientes sin CSS (la app de motoristas). La web los toma de globals.css.
export const colors = {
  cielo: "#76A3E3",
  maya: "#8FC9FF",
  escarcha: "#A5C2E2",
  nube: "#BDE0FE",
  bruma: "#D1E8FC",
  aire: "#E5F0FA",
  tinta: "#0E1F3D",
  tintaSuave: "#46587A",
  marino: "#1E3F8A",
  accion: "#2A5BD7",
  blanco: "#FFFFFF",
  borde: "#5F82BD",
  linea: "#C9DAEE",
  error: "#B42318",
} as const;

export const spacing = { 1: 4, 2: 8, 4: 16, 6: 24, 10: 40 } as const;

export const radius = { sm: 8, md: 16, pill: 999 } as const;

export const typography = {
  display: { fontSize: 56, lineHeight: 60, fontWeight: "800" },
  titulo1: { fontSize: 36, lineHeight: 42, fontWeight: "700" },
  titulo2: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  titulo3: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  cuerpo: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  pequeno: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  etiqueta: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
} as const;

export type TypographyVariant = keyof typeof typography;

export const fontFamily = "Outfit";
