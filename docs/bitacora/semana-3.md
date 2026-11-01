# Semana 3

## Qué hice

- Escribí el modelo de datos con el diagrama y el diccionario de las tablas actuales.
- Agregué reglas a la base: qué pasa al borrar, UNIQUE y CHECK.
- Agregué los roles y los países de Centroamérica como datos base.
- Hice el flujo de organizaciones y usuarios: crear y editar organizaciones, crear usuarios y listas paginadas.
- Hice un script de datos semilla con comercios y usuarios realistas de la región.
- Separé la base de desarrollo de la de producción.
- Desplegué el flujo y lo probé en producción.

## Qué decidí y por qué

- Borré user_organizations porque repetía lo mismo que users.organization_id.
- Mantuve teams y team_members.
- El flujo central de la semana es organizaciones y usuarios, porque todo lo demás depende de eso.
- La validación va en tres lugares: en la pantalla, en el servidor y en la base.
- Crear y editar organizaciones es solo del superadmin. El administrador de un comercio solo ve y maneja su organización.
- La semilla solo corre en desarrollo y en una base vacía, para no tocar datos reales.

## Qué le pedí a la IA

- Un plan para la entrega de la semana.
- El modelo de datos, las migraciones, la semilla y el flujo de organizaciones y usuarios.
- Ayuda para conectar la nueva base de desarrollo en Railway.

## Qué acepté, cambié o descarté

Acepté el plan, las reglas de la base y el flujo de organizaciones y usuarios.

Cambié el diagrama para que solo muestre las tablas que existen hoy.

Descarté user_organizations.

## Qué aprendí

- Las reglas de la base son la última protección si algo pasa la validación de la pantalla y del servidor.
- Tener una base solo para desarrollo me deja probar sin miedo a dañar datos reales.
- En Railway la contraseña de Postgres se guarda la primera vez que se crea la base; si no coincide con la variable, hay que cambiarla desde la consola.
