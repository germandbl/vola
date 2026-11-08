# Volá! Motoristas

App de motoristas de Volá!, hecha con Expo y Expo Router.

## Correrla

1. Levantá el API (`pnpm --filter ./apps/api start:dev` desde la raíz del repo).
2. Copiá `.env.example` a `.env.local` y poné en `EXPO_PUBLIC_API_URL` la dirección del API.
   En un teléfono físico, `localhost` es el teléfono: usá la IP de tu computadora en la red local, por ejemplo `http://192.168.1.39:8000`.
3. Desde esta carpeta: `npx expo start` y abrí la app en Expo Go o en un simulador.

## Antes de terminar un cambio

```bash
npx tsc --noEmit
npx expo lint
```
