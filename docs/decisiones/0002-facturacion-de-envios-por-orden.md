# 0002. Facturación de envíos marcada en cada orden

Fecha: semana 6.

Actualización (issue #95): ya no se factura todo lo pendiente de una vez. Volá! elige un rango de fechas, que tiene que terminar a más tardar ayer, y entran las órdenes por facturar entregadas en esos días. Los rangos de un mismo cliente y tipo de factura no se pueden cruzar. `orders.invoice_id` sigue evitando que una orden quede en dos facturas.

## Contexto

Volá! cobra a cada comercio el envío de las órdenes que entregan sus motoristas. Las órdenes que entrega un motorista propio del comercio no se cobran. El costo de envío de Volá! ya se calcula y se guarda en cada orden al crearla (`orders.vola_delivery_fee`), según la tarifa por distancia o por cantidad de órdenes del comercio. Hacía falta saber qué órdenes ya se facturaron, que ninguna se facture dos veces y que el comercio pueda ver qué le cobran.

## Decisión

- Una tabla `invoices` con el comercio, el monto, quién la generó y, cuando se paga, la fecha y quién registró el pago.
- Cada orden apunta a su factura con `orders.invoice_id`. Una orden está por facturar si está entregada, la entregó un motorista cuya organización es Volá! y no tiene factura.
- Al generar una factura entran todas las órdenes pendientes del comercio de una vez, dentro de una transacción con `SELECT ... FOR UPDATE`.
- El monto es la suma de `vola_delivery_fee` de esas órdenes, el valor que se guardó al crear cada una.

## Alternativas

- **Facturas por periodo con fecha de inicio y fin**: es lo habitual en contabilidad, pero obliga a elegir fechas, manejar órdenes que cruzan periodos y decidir qué pasa con órdenes viejas sin facturar. Hoy alcanza con facturar todo lo pendiente cuando Volá! lo decida.
- **Recalcular el envío al facturar**: si la tarifa cambia entre la entrega y la factura, el comercio pagaría un precio distinto al que vio en la orden.
- **Una tabla aparte con una fila por orden facturada**: copia datos que ya están en la orden y no agrega nada mientras una orden solo pueda estar en una factura.
- **Guardar un saldo por comercio**: hay que mantenerlo sincronizado con las órdenes y es fácil que se desfase; con `invoice_id` el pendiente se calcula siempre desde las órdenes.

## Consecuencias

- Una orden no puede quedar en dos facturas, y si dos personas facturan a la vez la segunda recibe 409.
- Lo pendiente de cada comercio se calcula con una consulta, sin saldos que mantener.
- Es el mismo patrón que la liquidación de efectivo (`driver_settlement_id` y `merchant_settlement_id`), así que se entiende igual.
- No hay facturas parciales ni anulación de facturas. Si se necesitan, habrá que agregar un estado o permitir quitar órdenes de una factura.
- La factura no es un documento fiscal: no tiene número de la autoridad tributaria ni impuestos.
