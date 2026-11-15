# Semana 5

## Qué hice

- Terminé el recorrido de la orden: detalle, preparación, asignar, reasignar y liberar motorista, completar y cancelar.
- Agregué la app de motoristas: iniciar sesión, marcarse disponible, ver las órdenes asignadas y avanzar su estado.
- Agregué un módulo nativo para iOS y Android que comparte la ubicación del motorista también en segundo plano.
- Agregué el seguimiento de la orden con un enlace público y un mapa con la sucursal, el cliente y el motorista.
- Agregué el método de pago de la orden: tarjeta o efectivo.
- Agregué la liquidación del efectivo: el motorista de Volá! liquida a Volá! y Volá! al comercio; el motorista propio liquida directo a su comercio.
- Separé las órdenes en activas, completadas y canceladas, y las activas se actualizan solas cada 10 segundos en el panel y en la app.
- Agregué el mapa de motoristas y los permisos de los agentes.
- Hice las pruebas con usuarios y las escribí en `docs/pruebas-usuarios.md`.

## Qué decidí y por qué

- La ubicación la envía el código nativo y no JavaScript, porque en segundo plano el sistema suspende JavaScript.
- El enlace de seguimiento usa un código aleatorio y no el número de la orden, para que nadie vea otra orden cambiando la URL.
- Las actualizaciones en tiempo real usan consultas cada 10 segundos y no WebSockets, porque con la cantidad de usuarios de hoy alcanza y es más simple de mantener.
- El efectivo pendiente se calcula con las órdenes entregadas en efectivo que todavía no tienen liquidación, sin guardar saldos aparte.
