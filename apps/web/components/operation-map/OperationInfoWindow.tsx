"use client";

import { InfoWindow } from "@vis.gl/react-google-maps";
import type { OperationMap } from "@vola/shared";
import { BranchInfo } from "./BranchInfo";
import { DriverInfo } from "./DriverInfo";
import { OrderInfo } from "./OrderInfo";
import type { OperationLayer } from "./LayerToggles";

// La ventana se abre sobre el pin, que se dibuja hacia arriba del punto.
const INFO_WINDOW_OFFSET: [number, number] = [0, -48];

export interface SelectedItem {
  layer: OperationLayer;
  id: number;
}

interface OperationInfoWindowProps {
  operation: OperationMap;
  selected: SelectedItem;
  showDriverOwner: boolean;
  onClose: () => void;
}

// Si lo seleccionado ya no está (la orden se entregó, el motorista dejó de trabajar), la ventana se cierra.
export function OperationInfoWindow({ operation, selected, showDriverOwner, onClose }: OperationInfoWindowProps) {
  const commonProps = { pixelOffset: INFO_WINDOW_OFFSET, onCloseClick: onClose };

  if (selected.layer === "drivers") {
    const driver = operation.drivers.find((candidate) => candidate.driverId === selected.id);
    if (!driver) return null;
    return (
      <InfoWindow
        {...commonProps}
        position={{ lat: driver.latitude, lng: driver.longitude }}
        headerContent={<p className="font-semibold text-tinta">{driver.name}</p>}
      >
        <DriverInfo driver={driver} showOwner={showDriverOwner} />
      </InfoWindow>
    );
  }
  if (selected.layer === "orders") {
    const order = operation.orders.find((candidate) => candidate.id === selected.id);
    if (!order) return null;
    return (
      <InfoWindow
        {...commonProps}
        position={{ lat: order.latitude, lng: order.longitude }}
        headerContent={<p className="font-semibold text-tinta">Orden #{order.id}</p>}
      >
        <OrderInfo order={order} />
      </InfoWindow>
    );
  }
  const branch = operation.branches.find((candidate) => candidate.id === selected.id);
  if (!branch) return null;
  return (
    <InfoWindow
      {...commonProps}
      position={{ lat: branch.latitude, lng: branch.longitude }}
      headerContent={<p className="font-semibold text-tinta">{branch.name}</p>}
    >
      <BranchInfo branch={branch} />
    </InfoWindow>
  );
}
