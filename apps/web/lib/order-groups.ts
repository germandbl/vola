import { OrderGroup } from "@vola/shared";

export const ORDER_GROUP_PATH: Record<OrderGroup, string> = {
  [OrderGroup.Active]: "/ordenes",
  [OrderGroup.Completed]: "/ordenes/completadas",
  [OrderGroup.Cancelled]: "/ordenes/canceladas",
};

export const ORDER_GROUP_LABEL: Record<OrderGroup, string> = {
  [OrderGroup.Active]: "Activas",
  [OrderGroup.Completed]: "Completadas",
  [OrderGroup.Cancelled]: "Canceladas",
};

export const ORDER_GROUP_EMPTY: Record<OrderGroup, { title: string; description: string }> = {
  [OrderGroup.Active]: {
    title: "No hay órdenes activas",
    description: "Las órdenes nuevas y las que van en camino aparecen acá.",
  },
  [OrderGroup.Completed]: {
    title: "Todavía no hay órdenes entregadas",
    description: "Cuando un motorista entregue una orden, va a aparecer acá.",
  },
  [OrderGroup.Cancelled]: {
    title: "No hay órdenes canceladas",
    description: "Las órdenes que se cancelen van a aparecer acá con su motivo.",
  },
};
