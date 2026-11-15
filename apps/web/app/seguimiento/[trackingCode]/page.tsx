import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PublicTrackingView } from "@/components/tracking/PublicTrackingView";
import { Spinner } from "@/components/ui/spinner";
import { loadPublicTracking } from "@/lib/tracking-actions";

export const metadata: Metadata = {
  title: "Seguí tu pedido · Volá!",
  description: "Mirá en el mapa por dónde va tu pedido.",
  // El enlace es privado de cada pedido: los buscadores no deben indexarlo.
  robots: { index: false, follow: false },
};

type TrackingPageProps = PageProps<"/seguimiento/[trackingCode]">;

async function TrackingContent({ params }: Pick<TrackingPageProps, "params">) {
  const { trackingCode } = await params;
  const tracking = await loadPublicTracking(trackingCode);
  if (!tracking) notFound();

  return <PublicTrackingView trackingCode={trackingCode} initialTracking={tracking} />;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh items-center justify-center bg-aire">
          <Spinner />
        </main>
      }
    >
      <TrackingContent params={params} />
    </Suspense>
  );
}
