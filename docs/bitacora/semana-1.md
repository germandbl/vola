# Semana 1

## Qué hice

- Armé el monorepo con la API, la web, la app de motoristas y un paquete compartido.
- Escribí CLAUDE.md con las reglas de código y DESIGN.md con la guía de diseño.
- Creé el esquema de la base de datos y sus migraciones.
- Hice la autenticación en la API y un script para crear el primer superadmin.
- Hice el login y el panel web.

## Qué decidí y por qué

- Sesiones en la base de datos en vez de JWT, para poder quitarle el acceso a alguien al momento.
- Solo email y contraseña. El login por SMS cuesta dinero y no lo necesito todavía.
- Sesiones de 30 días para que los motoristas no tengan que entrar a cada rato.
- Los usuarios los crea un superadmin. El registro público viene después.
- Usar shadcn/ui en la web en vez de hacer los componentes manualmente.

## Qué le pedí a la IA

- Pasar mi diagrama de base de datos a código.
- Un plan para la autenticación antes de programarla.
- El login y el panel web.
- Cambiar los componentes a shadcn.
- Buscar buenas prácticas de diseño y mejorar el login visualmente.

## Qué acepté, cambié o descarté

Acepté el plan de autenticación y las correcciones a mi diagrama de base de datos.

Cambié el primer diseño del login porque no me convenció, los componentes hechos a mano por los de shadcn, el color del menú y los botones, y los textos de ejemplo de los campos.

Descarté el texto de ayuda debajo del login.

## Qué aprendí

- Pedir un plan antes del código me ayudó a decidir lo importante sin leer todo el código.
- Hay que revisar bien los cambios de versión de las herramientas. Quedaron archivos viejos de pnpm que rompían otras cosas.
- Como no soy tan bueno en diseño de UI, me funcionó mejor dejar que la IA aplicara buenas prácticas que elegir entre opciones o sugerencias mías.
