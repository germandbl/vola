# Volá! — DESIGN.md

Volá! es una plataforma de delivery hecha en Centroamérica. El nombre viene de lo que decimos para apurar a alguien: "¡volá!". La marca promete rapidez con un tono ligero y cercano: azules suaves como un cielo despejado, letras redondas y un lenguaje de barrio, nunca de oficina.

Este documento es la fuente de verdad del diseño para:

- `apps/mobile`: app de motoristas (React Native / Expo)
- `apps/web`: web de comercios y superadmins (Next.js)
- Material de calle y redes sociales

---

## 1. Personalidad

- **Rápida**: frases cortas, verbos al inicio, nada de rodeos.
- **Cercana**: hablamos de vos, como se habla en la región.
- **Ligera**: el azul cielo da calma y confianza; la energía la pone el lenguaje, no colores agresivos.
- **Confiable**: comercios y clientes nos dan su dinero y su tiempo. Claridad antes que ingenio.

## 2. Voz y tono

Usamos el voseo centroamericano y el imperativo directo.

| Hacemos | Evitamos |
| --- | --- |
| "Tu pedido ya va volando." | "Su orden se encuentra en proceso de envío." |
| "Pedí lo que querás." | "Ordene ahora sus productos favoritos." |
| "Tu motorista llega en 12 min." | "El tiempo estimado de entrega es de aproximadamente 12 minutos." |
| "No pudimos cobrar. Probá con otra tarjeta." | "Error en el procesamiento del pago." |

- El signo de exclamación se reserva para el nombre (Volá!) y celebraciones ("¡Llegó!"). Nunca en errores ni avisos.
- Con comercios el tono baja un poco: sigue de vos y directo, pero con datos claros (montos, horarios, estados).
- Sin anglicismos innecesarios: "pedido", no "order"; "motorista", no "rider".
- Botones: verbo al inicio, 1 a 3 palabras, sin punto final ("Aceptar pedido", "Ver detalle").
- Errores: qué pasó y qué hacer, en una frase ("No hay conexión. Revisá tu internet.").

## 3. Logotipo

Todavía no hay logotipo diseñado. Mientras tanto, la marca se escribe como palabra: **Volá!** en Outfit 800, siempre con tilde y signo de exclamación.

- Sobre `cielo`, `maya`, `escarcha`, `nube`, `aire` o `blanco`: logotipo en `tinta`.
- Sobre `marino` o `accion`: logotipo en `blanco`.
- Nunca en blanco sobre `cielo` ni ningún azul claro (2.6:1 o menos, no se lee).
- Nunca "Vola" sin tilde ni sin exclamación.
- Área de respeto: la altura de la letra "V" alrededor de todo el logotipo.

---

## 4. Colores

La paleta parte de azules suaves de cielo y se completa con azules profundos que hacen el trabajo pesado: texto, botones y fondos oscuros.

### 4.1 Azules de marca (identidad)

| Token | Hex | Uso | Texto encima |
| --- | --- | --- | --- |
| `cielo` | `#76A3E3` | El color de Volá!. Mochilas, uniformes, ícono de la app, portadas. | `tinta` (6.3:1) |
| `maya` | `#8FC9FF` | Apoyo brillante. Promos, ilustraciones, bloques destacados. | `tinta` (9.3:1) |
| `escarcha` | `#A5C2E2` | Pantone 14-4130 TCX Blue Frost. Impresión y textiles. | `tinta` (8.9:1) |
| `nube` | `#BDE0FE` | Chips, etiquetas, estados seleccionados. | `tinta`, `tinta-suave` |
| `bruma` | `#D1E8FC` | Hover, filas alternas, avisos informativos. | `tinta`, `tinta-suave` |
| `aire` | `#E5F0FA` | Fondo de página en app y web. | `tinta`, `tinta-suave`, `marino`, `accion` |

### 4.2 Azules de trabajo (texto y acción)

| Token | Hex | Uso | Texto encima |
| --- | --- | --- | --- |
| `tinta` | `#0E1F3D` | Texto principal y logotipo sobre todos los azules claros y blanco. | — |
| `tinta-suave` | `#46587A` | Texto secundario sobre blanco, aire, bruma y nube (5.2:1 o más). No sobre cielo ni maya. | — |
| `marino` | `#1E3F8A` | Barra lateral de la web, bloques oscuros, encabezados. | `blanco` (9.8:1) |
| `accion` | `#2A5BD7` | Botones principales, enlaces, anillo de foco. | `blanco` (5.9:1) |

### 4.3 Neutros y bordes

| Token | Hex | Uso |
| --- | --- | --- |
| `blanco` | `#FFFFFF` | Tarjetas, menús y modales sobre `aire`. |
| `borde` | `#5F82BD` | Bordes de campos y controles (3.4:1 o más sobre blanco y aire). |
| `linea` | `#C9DAEE` | Separadores y bordes decorativos. No para controles. |

### 4.4 Regla de oro: texto oscuro sobre azul claro

Los azules suaves **no aguantan texto blanco**. Todo texto sobre `cielo`, `maya`, `escarcha`, `nube`, `bruma` o `aire` va en `tinta` (o `tinta-suave` donde se indica). El texto blanco solo va sobre `marino` y `accion`.

| Fondo | Texto permitido | Contraste |
| --- | --- | --- |
| `cielo` | `tinta` | 6.3:1 |
| `maya` / `escarcha` | `tinta` | 8.9:1 o más |
| `nube` / `bruma` / `aire` | `tinta`, `tinta-suave` | 5.0:1 o más |
| `marino` | `blanco` | 9.8:1 |
| `accion` | `blanco` | 5.9:1 |

### 4.5 Proporción

- **Pantallas**: ~60% `aire` y `blanco`, 25% azules de marca, 10% `tinta` y `marino`, 5% `accion` (solo lo que se toca).
- **Calle** (mochilas, chalecos, cascos): `cielo` domina, logotipo grande en `tinta`, franja reflectiva para seguridad nocturna.

---

## 5. Tipografía

Una sola familia: **Outfit** (Google Fonts, gratuita). Geométrica y redonda: moderna y amigable, y en 800 tiene la fuerza que pide el nombre.

| Token | Tamaño / interlineado | Peso | Uso |
| --- | --- | --- | --- |
| `display` | 56 / 60 px | 800 | Logotipo, portadas, campañas |
| `titulo-1` | 36 / 42 px | 700 | Títulos de página |
| `titulo-2` | 24 / 30 px | 700 | Secciones |
| `titulo-3` | 18 / 24 px | 600 | Títulos de tarjeta |
| `cuerpo` | 16 / 24 px | 400 | Texto general |
| `pequeno` | 14 / 20 px | 400 | Datos secundarios, ayudas |
| `etiqueta` | 12 / 16 px | 600 | Chips, estados, botones pequeños |

- Mayúscula solo al inicio de la frase (sentence case). Nada de títulos en MAYÚSCULAS sostenidas.
- Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.

## 6. Espaciado

Múltiplos de 4.

| Token | Valor | Uso |
| --- | --- | --- |
| `space-1` | 4px | Entre ícono y texto |
| `space-2` | 8px | Dentro de chips y listas compactas |
| `space-4` | 16px | Padding de tarjetas, márgenes laterales en móvil |
| `space-6` | 24px | Entre bloques, padding de secciones |
| `space-10` | 40px | Entre secciones grandes en la web |

## 7. Radios

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-sm` | 8px | Campos, chips, etiquetas |
| `radius-md` | 16px | Tarjetas, modales, bloques de marca |
| `radius-pill` | 999px | Botones principales, burbujas de estado del pedido |

## 8. Elevación

- Sin sombras pesadas ni degradados.
- La profundidad se logra con `blanco` sobre `aire` y una `linea` de 1px.
- Si hace falta una sombra (menús flotantes, modales): `0 4px 16px rgba(14, 31, 61, 0.08)`.

## 9. Recurso gráfico: líneas de velocidad

Píldoras horizontales de alto 8px y largos distintos, como estelas de algo que pasa volando. Se usan en portadas, empaques, fondos de redes y pantallas vacías. Nunca encima del texto ni más de un grupo por composición.

## 10. Iconografía

- Íconos de trazo (outline), esquinas redondeadas, grosor uniforme 1.5–2px.
- Color `tinta` o `accion`.
- Recomendado: Tabler Icons o Lucide (gratuitos, mismo estilo, disponibles para React y React Native).
- Nada de íconos rellenos ni emojis en la interfaz.

---

## 11. Componentes base

### Botón principal
- Fondo `accion`, texto `blanco`, estilo `etiqueta` a 16px / 600, `radius-pill`.
- Alto 48px en móvil, 40px en web. Padding horizontal `space-6`.
- Hover/pressed: fondo `marino`.
- Foco: anillo de 2px `accion` con 2px de separación en el color del fondo.

### Botón secundario
- Fondo `blanco`, borde 1px `borde`, texto `tinta`, `radius-pill`.
- Hover: fondo `bruma`.

### Campo de texto
- Fondo `blanco`, borde 1px `borde`, `radius-sm`, alto 44px, texto `cuerpo` en `tinta`.
- Placeholder en `tinta-suave` con un ejemplo real ("Ej. Col. Palmira, casa 12").
- Foco: borde `accion` de 2px.
- Error: mensaje debajo en `pequeno`, qué pasó y qué hacer.

### Tarjeta
- Fondo `blanco`, borde 1px `linea`, `radius-md`, padding `space-4`.
- Título en `titulo-3`, metadatos en `pequeno` / `tinta-suave`.

### Chip de estado del pedido
- Fondo `nube`, texto `tinta`, estilo `etiqueta`, `radius-pill`, padding `space-1` × `space-2`.
- Los estados se distinguen por texto e ícono, no solo por color.

| Estado | Texto del chip |
| --- | --- |
| Nuevo | "Nuevo" |
| Preparando | "Preparando" |
| En camino | "Va volando" |
| Entregado | "Entregado" |
| Cancelado | "Cancelado" |

### Barra lateral (web de comercios y superadmins)
- Fondo `marino`, texto e íconos `blanco`.
- Ítem activo: fondo `accion`, texto `blanco`.
- El panel de superadmin usa el mismo sistema, con un chip `etiqueta` "Admin" junto al logotipo.

---

## 12. Aplicaciones

- **App de motoristas**: fondo `aire`, tarjetas `blanco`, botón "Aceptar pedido" en `accion` con `radius-pill`, estados en chips `nube`.
- **Web de comercios y superadmins**: barra lateral `marino`, contenido sobre `aire`, tablas con filas alternas `bruma`.
- **Material de calle**: mochila y chaleco en `cielo` (o `escarcha` para tela, que es su Pantone), logotipo en `tinta`, franja reflectiva.
- **Redes sociales**: fondos `cielo` o `maya`, títulos en `tinta`, líneas de velocidad como recurso.

## 13. Qué no hacer

- Texto blanco sobre cualquier azul claro.
- Mezclar la paleta con rojo o naranja de marca (son los colores de la competencia).
- Usar `accion` como fondo de grandes áreas; es solo para lo que se toca.
- Deformar, inclinar o cambiar el color del logotipo fuera de las reglas.
- Comunicar un estado solo con color.

---

## 14. Tokens para código

### CSS (`packages/ui/tokens.css` o `app/globals.css`)

```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap");

:root {
  /* Azules de marca */
  --cielo: #76A3E3;
  --maya: #8FC9FF;
  --escarcha: #A5C2E2;
  --nube: #BDE0FE;
  --bruma: #D1E8FC;
  --aire: #E5F0FA;

  /* Azules de trabajo */
  --tinta: #0E1F3D;
  --tinta-suave: #46587A;
  --marino: #1E3F8A;
  --accion: #2A5BD7;

  /* Neutros y bordes */
  --blanco: #FFFFFF;
  --borde: #5F82BD;
  --linea: #C9DAEE;

  /* Tipografía */
  --font-sans: "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Espaciado */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-10: 40px;

  /* Radios */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-pill: 999px;
}

body {
  background: var(--aire);
  color: var(--tinta);
  font-family: var(--font-sans);
}
```

### TypeScript compartido (`packages/shared/src/theme.ts`)

Neutro (sin DOM ni Node), para usarlo en Next.js y React Native.

```ts
export const colors = {
  cielo: '#76A3E3',
  maya: '#8FC9FF',
  escarcha: '#A5C2E2',
  nube: '#BDE0FE',
  bruma: '#D1E8FC',
  aire: '#E5F0FA',
  tinta: '#0E1F3D',
  tintaSuave: '#46587A',
  marino: '#1E3F8A',
  accion: '#2A5BD7',
  blanco: '#FFFFFF',
  borde: '#5F82BD',
  linea: '#C9DAEE',
} as const;

export const spacing = { 1: 4, 2: 8, 4: 16, 6: 24, 10: 40 } as const;

export const radius = { sm: 8, md: 16, pill: 999 } as const;

export const typography = {
  display: { fontSize: 56, lineHeight: 60, fontWeight: '800' },
  titulo1: { fontSize: 36, lineHeight: 42, fontWeight: '700' },
  titulo2: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  titulo3: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  cuerpo: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  pequeno: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  etiqueta: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

export const fontFamily = 'Outfit';
```

En React Native con Expo, carga la fuente con `@expo-google-fonts/outfit`. Ahí cada peso es una familia distinta (`Outfit_400Regular`, `Outfit_600SemiBold`, `Outfit_700Bold`, `Outfit_800ExtraBold`), así que conviene mapear `fontWeight` a la familia correspondiente.