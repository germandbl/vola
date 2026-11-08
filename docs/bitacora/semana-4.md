# Semana 4

## Qué hice

- Escribí `docs/permisos.md` con la matriz de acciones por rol y las reglas de propiedad del dato.
- Agregué permisos sueltos por usuario: ver organizaciones, manejar comercios, manejar tarifas de envío y crear órdenes.
- Agregué la gestión de tarifas de envío por comercio, por distancia y por cantidad de órdenes.
- Agregué comercios dentro de las organizaciones y sus sucursales con horarios.
- Agregué la creación de órdenes desde el panel, con la lista de órdenes filtrada según quién la pide.

## Qué decidí y por qué

- Los permisos se revisan en el servidor, en los services, con funciones de `packages/shared` que también usa el panel para mostrar u ocultar opciones.
- Los permisos de ver organizaciones, manejar comercios y manejar tarifas solo cuentan para usuarios de Volá!, porque dan acceso a todos los comercios.
- Una orden pertenece a la organización de la sucursal de origen, así el servidor sabe a quién le pertenece sin confiar en lo que manda la pantalla.

## Prueba de permisos

| Caso | Resultado |
| --- | --- |
| Alguien sin sesión pide cualquier ruta que no sea el login. | No lo deja: 401. |
| Un administrator de un cliente entra a la lista de organizaciones. | No lo deja: 403. |
| Un administrator de un cliente entra a su organización. | Lo deja entrar. |
| Un administrator de un cliente entra a otra organización. | No lo deja: 403. |
| Un administrator de un cliente crea un usuario en su organización. | Lo deja. |
| Un administrator de un cliente crea un usuario en otra organización. | No lo deja: 403. |
| Un administrator de un cliente crea o edita una organización. | No lo deja: 403. |
| Un administrator de un cliente crea o edita un comercio o una sucursal. | No lo deja: 403. |
| Un administrator de un cliente cambia las tarifas de envío. | No lo deja: 403. |
| Un administrator de un cliente ve las órdenes. | Solo le salen las de su organización. |
| Un administrator de un cliente crea una orden desde una sucursal de otra organización. | No lo deja: 403. |
| Un agent de un cliente entra a su organización. | No lo deja: 403. |
| Un agent de un cliente sin `orders.create` crea una orden. | No lo deja: 403. |
| Un agent de un cliente con `orders.create` crea una orden en su organización. | Lo deja. |
| Un agent de Volá! sin `organizations.view` entra a la lista de organizaciones. | No lo deja: 403. |
| Un agent de Volá! con `organizations.view` entra a la lista de organizaciones. | Lo deja entrar. |
| Un agent de Volá! con `merchants.manage` crea un comercio. | Lo deja. |
| Un administrator de Volá! crea o edita una organización. | No lo deja: 403. Solo el superadmin puede. |
| Un administrator de Volá! sin `delivery_fees.manage` cambia las tarifas de envío. | No lo deja: 403. |
| Un driver entra a organizaciones u órdenes. | No lo deja: 403. |
| Un superadmin crea y edita organizaciones, comercios, tarifas y órdenes. | Lo deja. |
