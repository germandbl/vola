# 0001. Sesiones guardadas en la base de datos

Fecha: semana 1.

## Contexto

La web y la app de motoristas necesitan saber quién hace cada pedido a la API. Un superadmin o un administrador puede despedir a un motorista o quitarle permisos a un agente, y ese cambio tiene que valer de inmediato, no cuando venza un token. Los motoristas usan la app todo el día y no queremos que tengan que iniciar sesión a cada rato.

## Decisión

Al iniciar sesión, la API crea un token aleatorio, guarda solo su hash SHA-256 en la tabla `sessions` con una vigencia de 30 días y devuelve el token. Cada pedido manda el token y la API busca la sesión, el usuario y sus permisos en la base. Cerrar sesión borra la fila.

## Alternativas

- **JWT firmado sin estado**: no consulta la base en cada pedido, pero no se puede revocar antes de que venza sin agregar una lista negra, y los permisos quedan congelados dentro del token hasta que se renueve.
- **JWT corto con token de renovación**: permite revocar al renovar, pero suma dos tokens, un flujo de renovación en la web y en la app, y los permisos siguen desfasados unos minutos.
- **Un proveedor externo de autenticación**: resuelve el login, pero agrega costo, otra dependencia y no evita tener que guardar roles y permisos en nuestra base.

## Consecuencias

- Quitar el acceso o cambiar permisos aplica en el siguiente pedido, sin volver a iniciar sesión.
- Cada pedido hace una consulta más a la base. Con la cantidad de usuarios de hoy no se nota.
- Si alguien lee la base, no puede usar las sesiones porque solo están los hashes.
- La web guarda el token en una cookie `httpOnly`, que el JavaScript del navegador no puede leer, y la app en `expo-secure-store`.
