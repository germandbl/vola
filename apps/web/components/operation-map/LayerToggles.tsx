import type { StaticImageData } from "next/image";
import Image from "next/image";
import branchMarker from "@/assets/markers/branch.png";
import customerMarker from "@/assets/markers/customer.png";
import driverMarker from "@/assets/markers/driver.png";
import { cn } from "@/lib/utils";

export type OperationLayer = "drivers" | "orders" | "branches";

const LAYER_LABEL: Record<OperationLayer, string> = {
  drivers: "Motoristas",
  orders: "Órdenes activas",
  branches: "Sucursales",
};

// El mismo pin que en el mapa: así el chip sirve también de leyenda.
const LAYER_MARKER: Record<OperationLayer, StaticImageData> = {
  drivers: driverMarker,
  orders: customerMarker,
  branches: branchMarker,
};

interface LayerToggleProps {
  layer: OperationLayer;
  count: number;
  isVisible: boolean;
  onToggle: (layer: OperationLayer) => void;
}

function LayerToggle({ layer, count, isVisible, onToggle }: LayerToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={isVisible}
      onClick={() => onToggle(layer)}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-accion focus-visible:outline-none",
        isVisible ? "border-transparent bg-nube text-tinta" : "border-linea bg-blanco text-muted-foreground",
      )}
    >
      <Image src={LAYER_MARKER[layer]} alt="" aria-hidden="true" className={cn("h-5 w-auto", !isVisible && "opacity-40")} />
      {LAYER_LABEL[layer]}
      <span className="font-semibold">{count}</span>
    </button>
  );
}

interface LayerTogglesProps {
  layers: OperationLayer[];
  counts: Record<OperationLayer, number>;
  visibleLayers: OperationLayer[];
  onToggle: (layer: OperationLayer) => void;
}

export function LayerToggles({ layers, counts, visibleLayers, onToggle }: LayerTogglesProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Capas del mapa">
      {layers.map((layer) => (
        <LayerToggle
          key={layer}
          layer={layer}
          count={counts[layer]}
          isVisible={visibleLayers.includes(layer)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
