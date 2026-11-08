# Permisos

Todos los permisos se revisan en el servidor (Nest). Las reglas están en `packages/shared/src/organization-access.ts` y cada service las llama antes de leer o escribir. Si no se cumplen, el servidor responde 403.

## Cómo funciona

- Todas las rutas piden sesión, menos `POST /auth/login`. La sesión viaja como token Bearer y en la base se guarda solo su hash.
- Cada usuario pertenece a una organización. Hay dos tipos:
  - **Plataforma**: Volá!.
  - **Cliente**: la empresa de un comercio.
- Cada usuario tiene un rol: `superadmin`, `administrator`, `agent` o `driver`.
- Además del rol, un usuario puede tener permisos sueltos (tabla `user_permissions`):
  - `organizations.view`: ver todas las organizaciones.
  - `merchants.manage`: crear y editar comercios y sucursales.
  - `delivery_fees.manage`: ver y cambiar las tarifas de envío.
  - `orders.create`: crear órdenes.
- `organizations.view`, `merchants.manage` y `delivery_fees.manage` solo cuentan si el usuario es de la plataforma. `orders.create` también sirve a un agent de un cliente, pero solo en su organización.

## Matriz de acciones por rol

- **Sí**: siempre puede.
- **Con permiso**: solo si tiene ese permiso.
- **Solo la suya**: solo con los datos de su organización.
- **No**: el servidor responde 403.

| Acción | Superadmin | Administrator de plataforma | Agent de plataforma | Administrator de cliente | Agent de cliente | Driver |
| --- | --- | --- | --- | --- | --- | --- |
| Iniciar y cerrar sesión, ver su sesión | Sí | Sí | Sí | Sí | Sí | Sí |
| Ver la lista de países | Sí | Sí | Sí | Sí | Sí | Sí |
| Ver todas las organizaciones | Sí | Sí | Con permiso `organizations.view` | No | No | No |
| Ver una organización | Sí | Sí | Con permiso `organizations.view` | Solo la suya | No | No |
| Crear y editar organizaciones | Sí | No | No | No | No | No |
| Ver los usuarios de una organización | Sí | Sí | Con permiso `organizations.view` | Solo la suya | No | No |
| Crear usuarios (administrator o agent) | Sí | Sí, en cualquier organización | No | Solo la suya | No | No |
| Ver comercios y sucursales | Sí | Sí | Con permiso `organizations.view` | Solo la suya | No | No |
| Crear y editar comercios y sucursales | Sí | Con permiso `merchants.manage` | Con permiso `merchants.manage` | No | No | No |
| Ver y cambiar tarifas de envío | Sí | Con permiso `delivery_fees.manage` | Con permiso `delivery_fees.manage` | No | No | No |
| Ver órdenes | Todas | Todas | Todas, con `organizations.view` u `orders.create` | Solo la suya | Solo la suya | No |
| Crear órdenes | Sí, para cualquier comercio | Con permiso `orders.create`, para cualquier comercio | Con permiso `orders.create`, para cualquier comercio | Solo la suya | Con permiso `orders.create`, solo la suya | No |

## Reglas de propiedad del dato

- Un usuario de un cliente solo ve y maneja datos de su organización: su organización, sus usuarios, sus comercios, sus sucursales y sus órdenes. El servidor compara `organization_id` del usuario con el del dato.
- Un comercio pertenece a una organización de tipo cliente. La plataforma no puede tener comercios.
- Una sucursal pertenece a un comercio. Para verla hay que poder ver el comercio.
- Una orden pertenece a la organización del comercio de la sucursal de origen. Al crearla, el servidor toma la organización de esa sucursal y revisa que el usuario pueda crear órdenes ahí.
- La lista de órdenes se filtra en el servidor: quien no puede ver todas solo recibe las de su organización.
- Al crear usuarios solo se puede elegir `administrator` o `agent`. Superadmin y driver no se crean desde el panel.
- El driver todavía no tiene acciones propias; solo puede iniciar sesión.

## Reglas en la base de datos

- `user_permissions` y `role_permissions` solo aceptan las cuatro claves de permiso conocidas (CHECK).
- Un usuario no puede tener el mismo permiso dos veces (UNIQUE).
