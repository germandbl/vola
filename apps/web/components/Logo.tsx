import Image from "next/image";
import logoBlanco from "@/assets/brand/logo-blanco.png";
import logoColor from "@/assets/brand/logo-color.png";

// Color sobre fondos claros; blanco sobre tinta (barra lateral). Así lo pide el kit de marca.
type LogoTone = "color" | "blanco";
type LogoSize = "medio" | "grande";

const LOGO_IMAGE = {
  color: logoColor,
  blanco: logoBlanco,
} as const;

// object-contain mantiene la proporción aunque una columna flex estire el ancho de la imagen.
const LOGO_SIZE_CLASS: Record<LogoSize, string> = {
  medio: "h-9 w-auto shrink-0 object-contain object-left",
  grande: "h-20 w-auto object-contain object-left",
};

interface LogoProps {
  tone: LogoTone;
  size: LogoSize;
}

export function Logo({ tone, size }: LogoProps) {
  return (
    <Image
      src={LOGO_IMAGE[tone]}
      alt="Volá!"
      priority
      className={LOGO_SIZE_CLASS[size]}
    />
  );
}
