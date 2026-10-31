type SpeedLinesBackground = "cielo" | "blanco";

interface SpeedLine {
  widthClass: string;
  offsetClass: string;
}

const SPEED_LINES: SpeedLine[] = [
  { widthClass: "w-24", offsetClass: "ml-16" },
  { widthClass: "w-44", offsetClass: "ml-0" },
  { widthClass: "w-16", offsetClass: "ml-28" },
  { widthClass: "w-32", offsetClass: "ml-8" },
];

// Cada fondo necesita colores distintos para que las líneas se vean sin competir con el texto.
const LINE_COLOR_CLASSES: Record<SpeedLinesBackground, string[]> = {
  cielo: ["bg-maya", "bg-blanco", "bg-nube", "bg-maya"],
  blanco: ["bg-nube", "bg-cielo", "bg-bruma", "bg-maya"],
};

interface SpeedLinesProps {
  background: SpeedLinesBackground;
}

export function SpeedLines({ background }: SpeedLinesProps) {
  const colorClasses = LINE_COLOR_CLASSES[background];
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {SPEED_LINES.map((line, index) => (
        <span
          key={index}
          className={`h-2 rounded-full ${line.widthClass} ${line.offsetClass} ${colorClasses[index]}`}
        />
      ))}
    </div>
  );
}
