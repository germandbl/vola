# Mapa de historias

Roles: superadmin, administrator, agent y driver.

- Superadmin: solo Volá. Tiene acceso a todo.
- Administrator: administra una organización y tiene acceso a todo dentro de ella. El de Volá es casi igual al superadmin.
- Agent: usuario de una organización con los permisos que le asignen.
- Driver: motorista. Solo usa la app.

Los usuarios de Volá ven todas las organizaciones según sus permisos. Los de un comercio solo ven la suya.

Cortes:
- Corte 1, MVP (semana 5): el superadmin da de alta comercios y drivers y puede asignar drivers a comercios. El comercio registra sus usuarios y sus propios drivers, ingresa órdenes y las asigna manualmente a un driver, y el driver entrega la orden. Con totales de la orden y seguimiento por GPS.
- Corte 2, versión completa (semana 10): solicitudes de cuenta, gestión de órdenes de la plataforma, cobros en efectivo, reglas de asignación y cobro, reportes, notificaciones y auditoría.

## Superadmin

Actividad: administrar organizaciones

- Iniciar sesión
  - Corte 1: email y contraseña.
- Crear organizaciones
  - Corte 1: nombre, país y tipo.
- Editar organizaciones
  - Corte 1: cualquier organización.
- Crear usuarios
  - Corte 1: para cualquier organización, con su rol.
- Asignar permisos a agents
  - Corte 1: agents de cualquier organización.
- Crear drivers y asignarlos a comercios
  - Corte 1: un driver de Volá puede estar asignado a varios comercios.

Actividad: gestionar órdenes de la plataforma

- Ver todas las órdenes
  - Corte 1: órdenes de todas las organizaciones.
- Ver drivers en el mapa
  - Corte 1: ubicación de los drivers disponibles.
- Reasignar o liberar órdenes
  - Corte 2: cambiar el driver o quitarle la orden.
- Completar, cancelar o cambiar el estado de una orden
  - Corte 2: cualquier orden.

Actividad: gestionar solicitudes

- Revisar solicitudes de cuenta
  - Corte 2: aprobar o rechazar solicitudes de drivers y comercios.

Actividad: configurar comercios

- Reglas de asignación
  - Corte 2: cómo se asignan las órdenes de cada comercio.
- Reglas de cobro
  - Corte 2: costo de envío o contrato de cada comercio.
- Configuración general
  - Corte 2: datos y opciones de cada comercio.

Actividad: supervisar

- Ver reportes
  - Corte 2: órdenes, entregas y cobros con filtros y exportación.
- Ver la bitácora de auditoría
  - Corte 2: quién hizo qué y cuándo.

## Administrator

Actividad: administrar su organización

- Crear usuarios
  - Corte 1: administrators, agents y drivers propios.
- Asignar permisos a agents
  - Corte 1: agents de su organización.
- Solicitar cuenta de comercio
  - Corte 2: registro público.

Actividad: manejar órdenes

- Crear órdenes
  - Corte 1: cliente, teléfono, dirección con Google Maps y totales.
- Ver órdenes
  - Corte 1: lista y detalle con estado.
- Asignar órdenes
  - Corte 1: elegir un driver disponible.
- Ver drivers en el mapa
  - Corte 1: ubicación de sus drivers.
- Reasignar, liberar, cancelar o cambiar el estado
  - Corte 2: órdenes de su organización.
- Ver cobros en efectivo
  - Corte 2: lo cobrado por cada driver.
- Buscar órdenes
  - Corte 2: por número, nombre o teléfono del cliente.

Actividad: controlar el negocio

- Ver reportes
  - Corte 2: órdenes, entregas y cobros con filtros y exportación.

## Agent

Actividad: trabajar según sus permisos

- Ver órdenes
  - Corte 1: de su organización, o de todas si es de Volá.
- Crear órdenes
  - Corte 1: igual que el administrator.
- Gestionar órdenes
  - Corte 1: asignar órdenes a drivers.
  - Corte 2: reasignar, liberar, cancelar o cambiar el estado.
- Gestionar drivers
  - Corte 1: crear drivers.
- Gestionar usuarios
  - Corte 1: crear usuarios.
- Ver configuración
  - Corte 2: configuración de su organización.

## Driver

Actividad: trabajar

- Iniciar sesión en la app
  - Corte 1: email y contraseña.
- Marcarse disponible o no disponible
  - Corte 1: solo recibe órdenes cuando está disponible.
- Solicitar cuenta
  - Corte 2: registro público con documentos.

Actividad: entregar órdenes

- Ver mis órdenes
  - Corte 1: dirección, teléfono y total.
- Cambiar el estado
  - Corte 1: en camino y entregada.
- Compartir mi ubicación
  - Corte 1: GPS mientras está disponible.
- Registrar el cobro en efectivo
  - Corte 2: monto cobrado al entregar.
- Recibir avisos
  - Corte 2: notificación cuando le asignan una orden.
