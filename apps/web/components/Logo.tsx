type LogoTone = "tinta" | "blanco";
type LogoSize = "medio" | "grande";

const LOGO_TONE_CLASS: Record<LogoTone, string> = {
  tinta: "text-tinta",
  blanco: "text-blanco",
};

const LOGO_SIZE_CLASS: Record<LogoSize, string> = {
  medio: "text-2xl",
  grande: "text-display",
};

interface LogoProps {
  tone: LogoTone;
  size: LogoSize;
}

export function Logo({ tone, size }: LogoProps) {
  return (
    <span
      className={`font-extrabold tracking-tight ${LOGO_TONE_CLASS[tone]} ${LOGO_SIZE_CLASS[size]}`}
    >
      Volá!
    </span>
  );
}
