# Volá!

Plataforma de delivery en Centroamérica. Monorepo con pnpm.

- `apps/api`: Nest.js (puerto 4000)
- `apps/web`: Next.js para comercios y superadmins (puerto 3000)
- `apps/mobile`: React Native con Expo, app de motoristas
- `packages/shared`: tipos, enums y esquemas Zod compartidos. Sin dependencias de Node ni del DOM.

Comandos: `pnpm dev` (api y web), `pnpm --filter ./apps/api dev` (solo backend).

## Principio número uno

Escribe lo más simple que resuelva el problema de hoy, no el de dentro de un año. Si hay dos formas de hacerlo, elige la que se entiende en una sola lectura.

- Nada de abstracciones "por si acaso": sin factories, genéricos ni capas extra hasta que haya al menos tres casos reales que lo necesiten.
- Repetir dos veces está bien. A la tercera, extrae una función.
- Si un cambio pequeño requiere tocar muchos archivos, la estructura está mal.

## Nombres

Los nombres dicen qué es o qué hace, sin abreviar. Código en inglés; textos de la interfaz en español.

```ts
// Mal
const d = await svc.get(id);
const flag = o.st === 2;
function proc(x) { ... }

// Bien
const order = await ordersService.findById(orderId);
const isDelivered = order.status === OrderStatus.Delivered;
function calculateDeliveryFee(distanceKm: number) { ... }
```

- Booleanos empiezan con `is`, `has`, `can`, `should`: `isActive`, `hasPendingOrders`.
- Funciones empiezan con un verbo: `createOrder`, `findMerchantById`, `sendReceipt`.
- Nada de números mágicos: usa constantes o enums con nombre.

```ts
// Mal
if (distance > 8) fee += 15;

// Bien
const MAX_STANDARD_DISTANCE_KM = 8;
const EXTRA_DISTANCE_FEE = 15;

if (distanceKm > MAX_STANDARD_DISTANCE_KM) {
  fee += EXTRA_DISTANCE_FEE;
}
```

## Funciones

- Una función hace una sola cosa. Si para describirla necesitas la palabra "y", divídela.
- Corta: si pasa de ~30 líneas, probablemente hace demasiado.
- Máximo 3 parámetros; si son más, recibe un objeto.
- Usa retornos tempranos en vez de anidar `if`.

```ts
// Mal
function canAcceptOrder(driver) {
  if (driver) {
    if (driver.isActive) {
      if (!driver.currentOrderId) {
        return true;
      }
    }
  }
  return false;
}

// Bien
function canAcceptOrder(driver: Driver): boolean {
  if (!driver.isActive) return false;
  if (driver.currentOrderId) return false;
  return true;
}
```

## Lógica simple antes que lógica ingeniosa

Prefiere código explícito y aburrido a una línea "inteligente".

```ts
// Mal
const total = items.reduce((a, i) => a + i.p * i.q * (i.d ? 1 - i.d / 100 : 1), 0);

// Bien
function getItemTotal(item: OrderItem): number {
  const subtotal = item.price * item.quantity;
  const discount = subtotal * (item.discountPercent / 100);
  return subtotal - discount;
}

const total = items.reduce((sum, item) => sum + getItemTotal(item), 0);
```

- Nada de ternarios anidados. Usa `if` o un objeto de mapeo.

```ts
// Mal
const label = s === 'new' ? 'Nuevo' : s === 'preparing' ? 'Preparando' : s === 'on_the_way' ? 'Va volando' : 'Entregado';

// Bien
const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.New]: 'Nuevo',
  [OrderStatus.Preparing]: 'Preparando',
  [OrderStatus.OnTheWay]: 'Va volando',
  [OrderStatus.Delivered]: 'Entregado',
  [OrderStatus.Cancelled]: 'Cancelado',
};

const label = ORDER_STATUS_LABEL[order.status];
```

## Tipos

- TypeScript estricto. Prohibido `any`; si de verdad no se conoce el tipo, usa `unknown` y valida.
- Los tipos, enums y esquemas que usan dos apps o más se definen una sola vez en `packages/shared`. Nunca dupliques un tipo en cada app.
- Valida las entradas externas (requests, formularios, respuestas de terceros) con Zod.

## Errores

- Nunca atrapes un error para ignorarlo.
- Lanza errores con mensajes que expliquen qué pasó.
- En el backend usa las excepciones de Nest (`NotFoundException`, `ForbiddenException`, etc.).

```ts
// Mal
try {
  await paymentsService.charge(order);
} catch (e) {}

// Bien
const order = await this.ordersRepository.findById(orderId);
if (!order) {
  throw new NotFoundException(`Order ${orderId} not found`);
}
```

## Comentarios

Explica el porqué, no el qué. Si el código necesita un comentario para entender qué hace, mejor renombra o simplifica. Si no es necesario indicar un porqué, no pongas comentarios, no son necesarios.

```ts
// Mal
// suma 1 al contador
retries++;

// Bien
// El proveedor de pagos a veces responde 502 en el primer intento; reintentamos una vez.
retries++;
```

## Backend (Nest)

- Un módulo por dominio: `orders`, `merchants`, `drivers`, `auth`. Cada uno con su controller, service y DTOs.
- Los controllers solo reciben, validan y delegan. La lógica va en los services.

## Frontend (Next.js y React Native)

- Componentes pequeños, un componente por archivo, nombre en PascalCase igual al archivo.
- Si un componente pasa de ~150 líneas, divídelo, pero no lo pongas en el mismo archivo, cada componente en un archivo aparte, correctamente agrupados en carpetas, solo si un componente es lo suficientemente pequeño y solo es usado por otro componente más, puedes ponerlos en el mismo archivo.
- La lógica de datos va en hooks (`useOrders`), no mezclada con el JSX.
- Usa los colores, espacios y tipografía de `DESIGN.md`. Nunca escribas colores hex sueltos en componentes.
- Textos de la interfaz en español con voseo: "Pedí", "Probá de nuevo".

## Antes de terminar una tarea

- El código compila sin errores de TypeScript.
- No quedan `console.log`, código comentado ni imports sin usar.
- Si cambiaste algo en `packages/shared`, revisa que las apps que lo usan sigan compilando.
- Haz el cambio mínimo que resuelve lo pedido; no refactorices código ajeno a la tarea sin preguntar.

## Diseño

@DESIGN.md