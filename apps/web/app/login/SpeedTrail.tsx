interface TrailLine {
  widthClass: string;
  colorClass: string;
  delayClass: string;
}

// Cada línea sale del borde izquierdo y termina dentro de la columna del formulario; la más larga, justo en su borde derecho (25rem de columna menos 1rem de margen).
// En pantallas angostas el porcentaje manda para que la estela no tape todo el ancho.
const TRAIL_LINES: TrailLine[] = [
  { widthClass: "w-[min(calc(50%+11.5rem),92%)]", colorClass: "bg-cielo", delayClass: "delay-0" },
  { widthClass: "w-[min(calc(50%+3rem),62%)]", colorClass: "bg-maya", delayClass: "delay-100" },
  { widthClass: "w-[min(calc(50%+7.5rem),78%)]", colorClass: "bg-nube", delayClass: "delay-200" },
];

export function SpeedTrail() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2 overflow-hidden">
      {TRAIL_LINES.map((line) => (
        <span
          key={line.colorClass}
          className={`h-2 rounded-r-full ${line.widthClass} ${line.colorClass} ${line.delayClass} animate-in fade-in slide-in-from-left duration-700 ease-out fill-mode-backwards motion-reduce:animate-none`}
        />
      ))}
    </div>
  );
}
