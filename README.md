# Volá!

Plataforma de delivery para comercios en Centroamérica.

Token de propiedad: LEARN-CAP-8C8378DA
App: 

## Problema

Muchos comercios coordinan sus entregas por WhatsApp y llamadas. No saben por dónde va cada pedido, suele haber conflicto por cobros hechos en efectivo y registro de todo en hojas de excel o cuadernos.

## Segmento

Comercios en Centroamérica que hacen entregas.

## Propuesta de valor

Un panel web donde el comercio ve sus pedidos y motoristas, y una app para que el motorista reciba y entregue los pedidos. Con trazabilidad de todas las órdenes y todos los cobros en efectivo hechos.

## Stack

- pnpm workspaces: un solo repo para la API, la web y la app, con tipos compartidos.
- NestJS: la API se organiza en un módulo por dominio y es fácil de mantener.
- PostgreSQL y Drizzle: los datos son relacionales y Drizzle da tipos y migraciones en SQL.
- Next.js y shadcn/ui: panel web para comercios y superadmins con componentes ya hechos y accesibles.
- React Native con Expo: una sola app para Android e iOS para los motoristas.
- Zod en packages/shared: las validaciones se escriben una vez y las usan todas las apps.
- Sesiones guardadas en la base de datos: puedo quitarle el acceso a un usuario al momento.
- Railway: base de datos y API en el mismo lugar.

## Definición de Hecho

Una historia está hecha cuando:

- Cumple todos sus criterios de aceptación.
- Compila sin errores y pasa el lint.
- Está desplegada en producción.

## Correr en local

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm --filter ./apps/api db:migrate
pnpm --filter ./apps/api db:create-superadmin --name "Nombre" --email correo@ejemplo.com --phone "+504..." --password "..."
pnpm dev
```
