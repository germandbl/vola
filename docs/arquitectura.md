# Arquitectura

## Diagrama de contexto

Quién usa Volá! y con qué sistemas externos habla.

```mermaid
flowchart LR
  superadmin["Superadmin y equipo de Volá!"]
  comercio["Administrador y agentes de un comercio"]
  motorista["Motorista"]
  cliente["Cliente del comercio"]

  vola["Volá!"]

  maps["Google Maps Platform<br/>(mapas, direcciones y rutas)"]

  superadmin -- "organizaciones, tarifas, liquidaciones y facturas" --> vola
  comercio -- "órdenes, motoristas propios y facturas" --> vola
  motorista -- "disponibilidad, ubicación y entregas" --> vola
  cliente -- "enlace público de seguimiento" --> vola
  vola -- "buscar direcciones, calcular la distancia por calle y mostrar mapas" --> maps
```

## Diagrama de contenedores

```mermaid
flowchart LR
  navegador["Navegador<br/>superadmin, comercio y cliente"]
  telefono["Teléfono del motorista"]

  subgraph vercel["Vercel"]
    web["apps/web<br/>Next.js + shadcn/ui"]
  end

  subgraph railway["Railway"]
    api["apps/api<br/>NestJS en Docker"]
    db[("PostgreSQL")]
  end

  mobile["apps/drivers-mobile<br/>React Native + Expo"]
  shared["packages/shared<br/>tipos, esquemas Zod y permisos"]
  maps["Google Maps Platform"]

  navegador -- HTTPS --> web
  telefono --> mobile
  web -- "HTTPS + token de sesión" --> api
  mobile -- "HTTPS + token de sesión" --> api
  api -- "SQL con Drizzle" --> db
  api -- "Routes API: distancia por calle" --> maps
  web -- "Maps JavaScript API y Places" --> maps

  shared -.-> web
  shared -.-> api
  shared -.-> mobile
```

- **apps/web**: panel de Volá! y de los comercios, y la página pública de seguimiento. Los componentes de servidor y las server actions llaman a la API con el token de sesión guardado en una cookie; el navegador nunca habla directo con la API.
- **apps/api**: toda la lógica y las reglas de permisos. Es la única que toca la base de datos.
- **apps/drivers-mobile**: app de motoristas. Guarda el token en `expo-secure-store` comparte la ubicación con un módulo nativo propio (`modules/vola-location`) que sigue funcionando en segundo plano, y muestra los mapas con `react-native-maps`.
- **PostgreSQL**: hay dos bases en Railway, una de desarrollo con la semilla y otra con los datos reales.
- **packages/shared**: se compila a JavaScript sin dependencias de Node ni del DOM, así lo usan las tres apps.

## Capas

### API (NestJS)

```mermaid
flowchart TB
  guard["AuthGuard<br/>busca la sesión y arma el AuthUser"]
  controller["Controller<br/>recibe y valida con Zod, delega"]
  service["Service<br/>reglas de negocio y permisos"]
  schema["Schema de Drizzle<br/>tablas, llaves y reglas de la base"]
  db[("PostgreSQL")]

  guard --> controller --> service --> schema --> db
```

- **Guard**: todas las rutas piden sesión salvo las marcadas con `@Public()`: estado de la API, login y seguimiento.
- **Controller**: solo recibe, valida con `ZodValidationPipe` y llama al service.
- **Service**: revisa los permisos con las funciones de `packages/shared` (`canInvoiceMerchants`, `canManageOrders`...) y lanza excepciones de Nest (`ForbiddenException`, `NotFoundException`, `ConflictException`).
- **Schema**: cada módulo define sus tablas en `*.schema.ts`. Las reglas importantes también viven en la base con `CHECK`, llaves foráneas y `UNIQUE`.

### Web (Next.js)

```mermaid
flowchart TB
  page["app/: páginas y layouts<br/>revisan el acceso con funciones de shared"]
  component["components/: componentes de servidor y de cliente<br/>con shadcn/ui"]
  hook["hooks/: estado de formularios y diálogos"]
  lib["lib/: datos (organizations-data.ts) y server actions (*-actions.ts)<br/>validan la respuesta con Zod"]
  api["API"]

  page --> component
  component --> hook
  component --> lib
  hook --> lib
  lib --> api
```

### App de motoristas (Expo)

```mermaid
flowchart TB
  screen["src/app/: pantallas con expo-router"]
  component["src/components/: componentes con los tokens de DESIGN.md"]
  hook["src/hooks/: datos y estado (useAssignedOrders...)"]
  lib["src/lib/: llamadas a la API"]
  native["modules/vola-location: ubicación nativa en iOS y Android"]
  api["API"]

  screen --> component
  screen --> hook
  hook --> lib --> api
  native --> api
```

## Estructura de carpetas

```text
vola/
├── apps/
│   ├── api/
│   │   ├── drizzle/              migraciones SQL generadas por drizzle-kit
│   │   ├── src/
│   │   │   ├── auth/             login, sesiones y guard
│   │   │   ├── organizations/    un módulo por dominio:
│   │   │   ├── merchants/          controller, service(s) y schema
│   │   │   ├── branches/
│   │   │   ├── orders/
│   │   │   ├── drivers/
│   │   │   ├── delivery-fees/
│   │   │   ├── settlements/
│   │   │   ├── invoices/
│   │   │   ├── tracking/
│   │   │   ├── operation-map/
│   │   │   ├── common/           paginación y validación con Zod
│   │   │   └── scripts/          crear superadmin y semilla
│   │   └── test/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (dashboard)/      rutas del panel en español: ordenes, motoristas, mapa,
│   │   │   │                     liquidaciones, facturas, organizaciones
│   │   │   ├── login/
│   │   │   └── seguimiento/      página pública de seguimiento
│   │   ├── components/           un componente por archivo, agrupados por dominio
│   │   │   └── ui/               componentes de shadcn/ui
│   │   ├── hooks/
│   │   └── lib/
│   └── drivers-mobile/
│       ├── src/
│       │   ├── app/              pantallas (expo-router)
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── session/
│       │   └── theme/
│       └── modules/vola-location/  módulo nativo de ubicación
├── packages/
│   └── shared/src/               tipos, enums, esquemas Zod y funciones de permisos
├── docs/
│   ├── arquitectura.md
│   ├── decisiones/
│   └── bitacora/
├── Dockerfile                    imagen de la API para Railway
├── CLAUDE.md
└── DESIGN.md
```
