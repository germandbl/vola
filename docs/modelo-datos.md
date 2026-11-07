# Modelo de datos

## Diagrama

```mermaid
erDiagram
  countries |o--o{ organizations : "tiene"
  countries ||--o{ drivers : "tiene"
  organizations ||--o{ users : "tiene"
  organizations ||--o{ teams : "tiene"
  organizations ||--o{ driver_merchant_assignments : "recibe"
  organizations ||--o{ merchants : "tiene"
  merchants ||--o| delivery_fee_rates : "cobra"
  merchants ||--o{ order_count_fee_ranges : "cobra"
  merchants ||--o{ branches : "tiene"
  branches ||--o{ branch_opening_hours : "abre"
  delivery_fee_rates ||--o{ delivery_fee_rate_ranges : "tiene"
  roles ||--o{ users : "asigna"
  roles ||--o{ role_permissions : "tiene"
  users ||--o{ user_permissions : "tiene"
  users ||--o| drivers : "es"
  users ||--o{ team_members : "pertenece"
  users ||--o{ sessions : "abre"
  teams ||--o{ team_members : "tiene"
  drivers ||--o{ driver_merchant_assignments : "trabaja en"

  countries {
    bigint id PK
    varchar name UK
    varchar code UK
    varchar currency
    timestamp created_at
  }
  organizations {
    bigint id PK
    varchar name
    bigint country_id FK
    organization_types type
    timestamp created_at
  }
  roles {
    bigint id PK
    varchar name UK
    timestamp created_at
  }
  role_permissions {
    bigint id PK
    bigint role_id FK
    varchar permission_key
    timestamp created_at
  }
  users {
    bigint id PK
    varchar name
    varchar email UK
    varchar password_hash
    varchar phone_number
    bigint role_id FK
    bigint organization_id FK
    timestamp created_at
  }
  user_permissions {
    bigint id PK
    bigint user_id FK
    varchar permission_key
    timestamp created_at
  }
  drivers {
    bigint id PK
    bigint user_id FK, UK
    bigint country_id FK
    timestamp created_at
  }
  driver_merchant_assignments {
    bigint id PK
    bigint driver_id FK
    bigint organization_id FK
    timestamp created_at
  }
  teams {
    bigint id PK
    varchar name
    bigint organization_id FK
    timestamp created_at
  }
  team_members {
    bigint id PK
    bigint user_id FK
    bigint team_id FK
    timestamp created_at
  }
  merchants {
    bigint id PK
    bigint organization_id FK
    varchar name
    varchar contact_name
    varchar contact_email
    varchar contact_phone
    delivery_fee_bases delivery_fee_basis
    timestamp created_at
  }
  delivery_fee_rates {
    bigint id PK
    bigint merchant_id FK, UK
    numeric extra_fee_per_km
    timestamp created_at
  }
  delivery_fee_rate_ranges {
    bigint id PK
    bigint rate_id FK
    numeric up_to_km
    numeric fee
    timestamp created_at
  }
  order_count_fee_ranges {
    bigint id PK
    bigint merchant_id FK
    integer up_to_order_count
    numeric fee
    timestamp created_at
  }
  branches {
    bigint id PK
    bigint merchant_id FK
    varchar name
    varchar address
    numeric latitude
    numeric longitude
    timestamp created_at
  }
  branch_opening_hours {
    bigint id PK
    bigint branch_id FK
    days_of_week day
    boolean is_open
    time opens_at
    time closes_at
    timestamp created_at
  }
  sessions {
    bigint id PK
    bigint user_id FK
    varchar token_hash UK
    timestamp expires_at
    timestamp created_at
  }
```

Relaciones:
- Uno a muchos: un país tiene muchas organizaciones y muchos motoristas; una organización tiene muchos usuarios, equipos y comercios; un rol tiene muchos usuarios y permisos; un usuario tiene muchos permisos y sesiones; una tarifa de envío tiene muchos rangos; un comercio tiene muchos rangos de tarifa por cantidad de pedidos y muchas sucursales; una sucursal tiene un horario por cada día de la semana.
- Uno a uno: un usuario puede ser un motorista; un comercio puede tener una tarifa de envío.
- Muchos a muchos: motoristas y comercios, a través de driver_merchant_assignments; usuarios y equipos, a través de team_members.

## Diccionario de datos

Todas las tablas tienen `id` como llave primaria (bigint generado por la base) y `created_at` NOT NULL con la fecha de creación.

### countries

- Llaves foráneas: ninguna.
- NOT NULL: name, code, currency.
- UNIQUE: name, code.
- CHECK: code son 2 letras mayúsculas (ISO 3166). currency son 3 letras mayúsculas (ISO 4217).

### organizations

- Llaves foráneas: country_id → countries. Al borrar el país: se impide si tiene organizaciones.
- NOT NULL: name, type. country_id puede ser nulo.
- UNIQUE: ninguna.
- CHECK: name no puede estar vacío. type solo puede ser merchant (un cliente) o platform (solo Volá!).

### roles

- Llaves foráneas: ninguna.
- NOT NULL: name.
- UNIQUE: name.
- CHECK: name solo puede ser superadmin, administrator, agent o driver.

### role_permissions

- Llaves foráneas: role_id → roles. Al borrar el rol: se borran sus permisos.
- NOT NULL: role_id, permission_key.
- UNIQUE: role_id con permission_key.
- CHECK: permission_key solo puede ser organizations.view, delivery_fees.manage o merchants.manage.

### users

- Llaves foráneas: role_id → roles y organization_id → organizations. Al borrar el rol o la organización: se impide si tiene usuarios.
- NOT NULL: name, email, password_hash, phone_number, role_id, organization_id.
- UNIQUE: email.
- CHECK: name y phone_number no pueden estar vacíos. email tiene que estar en minúsculas.

### user_permissions

- Llaves foráneas: user_id → users. Al borrar el usuario: se borran sus permisos.
- NOT NULL: user_id, permission_key.
- UNIQUE: user_id con permission_key.
- CHECK: permission_key solo puede ser organizations.view, delivery_fees.manage o merchants.manage.

### drivers

- Llaves foráneas: user_id → users y country_id → countries. Al borrar el usuario: se borra el motorista. Al borrar el país: se impide si tiene motoristas.
- NOT NULL: user_id, country_id.
- UNIQUE: user_id.
- CHECK: ninguno.

### driver_merchant_assignments

- Llaves foráneas: driver_id → drivers y organization_id → organizations. Al borrar el motorista o la organización: se borran sus asignaciones.
- NOT NULL: driver_id, organization_id.
- UNIQUE: driver_id con organization_id.
- CHECK: ninguno.

### teams

- Llaves foráneas: organization_id → organizations. Al borrar la organización: se borran sus equipos.
- NOT NULL: name, organization_id.
- UNIQUE: organization_id con name.
- CHECK: name no puede estar vacío.

### team_members

- Llaves foráneas: user_id → users y team_id → teams. Al borrar el usuario o el equipo: se borra la membresía.
- NOT NULL: user_id, team_id.
- UNIQUE: team_id con user_id.
- CHECK: ninguno.

### merchants

- Llaves foráneas: organization_id → organizations. Al borrar la organización: se borran sus comercios.
- NOT NULL: organization_id, name, contact_name, contact_email, contact_phone. delivery_fee_basis puede ser nulo: el comercio todavía no eligió cómo cobra el envío.
- UNIQUE: organization_id con name.
- CHECK: name, contact_name y contact_phone no pueden estar vacíos. contact_email tiene que estar en minúsculas. delivery_fee_basis solo puede ser distance o completed_orders.

### delivery_fee_rates

- Llaves foráneas: merchant_id → merchants. Al borrar el comercio: se borra su tarifa.
- NOT NULL: merchant_id. extra_fee_per_km puede ser nulo: sin cobro por km extra, el último rango no tiene límite.
- UNIQUE: merchant_id.
- CHECK: extra_fee_per_km no puede ser negativo.

### delivery_fee_rate_ranges

- Llaves foráneas: rate_id → delivery_fee_rates. Al borrar la tarifa: se borran sus rangos.
- NOT NULL: rate_id, fee. up_to_km puede ser nulo: es el último rango, sin límite de km.
- UNIQUE: rate_id con up_to_km, contando los nulos como iguales (solo un rango sin límite por tarifa).
- CHECK: up_to_km mayor que 0. fee no puede ser negativo.

### order_count_fee_ranges

- Llaves foráneas: merchant_id → merchants. Al borrar el comercio: se borran sus rangos.
- NOT NULL: merchant_id, fee. up_to_order_count puede ser nulo: es el último rango, cubre todos los pedidos que siguen en el mes.
- UNIQUE: merchant_id con up_to_order_count, contando los nulos como iguales (solo un rango sin límite por comercio).
- CHECK: up_to_order_count mayor que 0. fee no puede ser negativo.

### branches

- Llaves foráneas: merchant_id → merchants. Al borrar el comercio: se borran sus sucursales.
- NOT NULL: merchant_id, name, address, latitude, longitude.
- UNIQUE: merchant_id con name.
- CHECK: name y address no pueden estar vacíos. latitude va de -90 a 90 y longitude de -180 a 180.

### branch_opening_hours

- Llaves foráneas: branch_id → branches. Al borrar la sucursal: se borra su horario.
- NOT NULL: branch_id, day, is_open. opens_at y closes_at pueden ser nulos: un día cerrado no lleva horas.
- UNIQUE: branch_id con day.
- CHECK: day solo puede ser un día de lunes a domingo. Un día abierto lleva opens_at y closes_at, con closes_at después de opens_at; un día cerrado no lleva ninguna de las dos.

### sessions

- Llaves foráneas: user_id → users. Al borrar el usuario: se borran sus sesiones.
- NOT NULL: user_id, token_hash, expires_at.
- UNIQUE: token_hash.
- CHECK: expires_at tiene que ser posterior a created_at.
