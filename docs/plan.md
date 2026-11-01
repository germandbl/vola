# Plan

## Semanas

1. Monorepo, esquema inicial de base de datos e inicio de sesión.
2. Mapa de historias, backlog y la app en producción con el inicio de sesión.
3. Organizaciones y usuarios: crear organizaciones, crear usuarios con su rol, permisos por rol y permisos de agents. El comercio crea sus usuarios y drivers, y el superadmin asigna drivers a comercios.
4. Órdenes en el panel: crear órdenes con Google Maps y sus totales, lista, detalle y asignación manual a un driver disponible.
5. MVP. App de drivers con Expo: iniciar sesión, marcarse disponible, ver sus órdenes, cambiar el estado y entregar. Seguimiento por GPS en un mapa del panel.
6. Gestión de órdenes de la plataforma: reasignar, liberar, completar, cancelar y cambiar el estado. Cobros en efectivo.
7. Solicitudes de cuenta de drivers y comercios con documentos, y aprobación del superadmin.
8. Configuración por comercio: reglas de asignación, reglas de cobro de envío o contrato y configuración general.
9. Reportes con filtros, búsqueda de órdenes y exportación. Notificaciones al driver y bitácora de auditoría.
10. Panel instalable como PWA, ajustes y versión final.

## Cómo cubro lo mínimo del curso

Tablas: hoy hay 12. Con clientes, órdenes, estados, ubicaciones, disponibilidad, cobros, solicitudes, documentos, reglas de asignación, reglas de cobro, notificaciones y auditoría llegan a 25 o más.

Roles (4): superadmin, administrator, agent y driver.

Flujos completos (6):
1. Alta de organizaciones y usuarios (semana 3).
2. Crear y asignar una orden (semana 4).
3. Entregar una orden con seguimiento por GPS (semana 5).
4. Gestión de órdenes por la plataforma (semana 6).
5. Cobro en efectivo (semana 6).
6. Solicitud y aprobación de cuentas (semana 7).

Panel con reportes y exportación, búsqueda y filtros: semana 9.

Carga de archivos: documentos de las solicitudes de cuenta, semana 7.

Notificaciones: aviso de orden asignada al driver, semana 9.

Bitácora de auditoría: semana 9.

Integración externa: Google Maps para buscar direcciones y ver drivers en el mapa, semana 4.

PWA: el panel web se puede instalar en el teléfono, semana 10.
