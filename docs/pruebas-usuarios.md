# Pruebas con usuarios

Las pruebas se hicieron en producción: https://vola-omega.vercel.app y la app de motoristas.

## Participantes

- Un usuario como superadmin de Volá!.
- Un usuario como administrador de un comercio.
- Un usuario como agente de un comercio.
- Un usuario como motorista.

## Guion de tareas

Superadmin de Volá!

1. Iniciar sesión en el panel.
2. Crear una organización y editar sus datos.
3. Crear un comercio con una sucursal.
4. Configurar la tarifa de envío del comercio.
5. Crear un motorista de Volá! y elegir los comercios que atiende.
6. Ver a los motoristas que están trabajando en el mapa.
7. Recibir el efectivo de un motorista de Volá!.
8. Liquidar a un comercio el efectivo recibido.
9. Ver el historial de liquidaciones.

Administrador de un comercio

1. Iniciar sesión en el panel.
2. Crear un agente y darle permisos.
3. Crear un motorista propio.
4. Crear una orden y elegir el método de pago.
5. Asignar la orden a un motorista.
6. Marcar la preparación de la orden.
7. Seguir la orden en la pestaña Activas mientras se actualiza sola.
8. Copiar y abrir el enlace público de seguimiento.
9. Recibir el efectivo de un motorista propio.
10. Ver el efectivo de sus órdenes que tiene Volá!.

Agente de un comercio

1. Iniciar sesión en el panel.
2. Crear una orden con el permiso de crear órdenes.
3. Intentar una acción para la que no tiene permiso.

Motorista

1. Iniciar sesión en la app.
2. Marcarse disponible y compartir la ubicación.
3. Ver aparecer una orden asignada sin recargar.
4. Avanzar la orden hasta entregarla.
5. Ver si tiene que cobrar en efectivo y cuánto.
6. Ver el efectivo que tiene por liquidar.

## Resultados por tarea

- Superadmin de Volá!: completó las 9 tareas.
- Administrador de un comercio: completó las 10 tareas.
- Agente de un comercio: completó las 3 tareas. En la tercera, la plataforma no le dejó hacer la acción sin permiso, como se esperaba.
- Motorista: completó las 6 tareas.

## Hallazgos

No hubo hallazgos bloqueantes, graves ni menores.

## Decisión sobre la hipótesis

- Hipótesis 1, los comercios usarían la app para registrar los cobros en efectivo en vez del cuaderno o Excel: se mantiene. El comercio y Volá! registraron y liquidaron el efectivo desde la plataforma.
- Hipótesis 3, los motoristas usarían la app en cada entrega: se mantiene. El motorista hizo toda la entrega desde la app, desde recibir la orden hasta entregarla y ver el efectivo por liquidar.
