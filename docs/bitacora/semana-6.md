# Semana 6

## Qué hice

- Escribí `docs/arquitectura.md` con los diagramas de contexto y de contenedores, las capas de cada app y la estructura de carpetas.
- Registré dos decisiones en `docs/decisiones/`: sesiones en la base de datos y facturación de envíos marcada en cada orden.
- Agregué la facturación a comercios, el segundo flujo completo de la semana:
  - Volá! ve por comercio las órdenes que entregaron sus motoristas y todavía no se facturaron, con el total de envío, y genera la factura (#85, PR #87).
  - El administrador del comercio ve sus facturas y el detalle de cada orden, y Volá! registra el pago (#86, PR #88).
- Publiqué el release `semana-6`.

## Por qué este flujo

En la prueba con usuarios se mantuvo la hipótesis 1: los comercios registran y liquidan el efectivo desde la plataforma en vez del cuaderno o Excel. El siguiente paso con el dinero es lo que el comercio le debe a Volá! por los envíos, que hasta ahora no se registraba en ningún lado. Solo se factura el envío de las órdenes que entregó un motorista de Volá!; las de la flota propia del comercio no.

## Qué decidí y por qué

- Cada orden apunta a su factura con `invoice_id`, igual que con las liquidaciones de efectivo, así una orden no puede quedar en dos facturas y lo pendiente se calcula sin guardar saldos.
- La factura lleva el costo de envío que se guardó al crear cada orden, para que el comercio pague lo mismo que vio en la orden aunque la tarifa cambie después.
- Se factura todo lo pendiente del comercio de una vez, sin periodos, porque hoy Volá! decide cuándo cobrar.
- Solo el superadmin y los administradores de Volá! generan facturas y registran pagos. El administrador del comercio solo ve las suyas.

## Qué le pedí a la IA

- Ayuda para cumplir la entrega de la semana: arquitectura, decisiones, el segundo flujo, los PRs y la bitácora.
- Que me propusiera qué flujo construir. Me propuso registrar el monto cobrado en efectivo (#19); le pedí la facturación a comercios.
- El código del flujo en la API, la web y `packages/shared`, con sus migraciones, dividido en dos issues y dos PRs.
- Aplicar las migraciones en la base de desarrollo y en la de producción, y probar los permisos y los casos de error contra la de desarrollo.
- Los borradores de `docs/arquitectura.md`, las dos decisiones y esta bitácora.

## Qué acepté, cambié o descarté

Acepté la estructura de la facturación siguiendo el patrón de las liquidaciones, las pantallas y la división en dos PRs.

Cambié el flujo propuesto por la IA (cobro en efectivo registrado por el motorista) por la facturación a comercios.

Descarté facturas por periodo y anulación de facturas por ahora.

## Qué aprendí

- Reusar un patrón que ya funciona (las liquidaciones) hizo que un flujo nuevo saliera rápido y fácil de revisar.
- Un `UPDATE ... WHERE paid_at IS NULL` alcanza para que un pago no se registre dos veces, sin bloqueos extra.
