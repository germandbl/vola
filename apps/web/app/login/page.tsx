import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";
import { SpeedTrail } from "./SpeedTrail";

export const metadata: Metadata = {
  title: "Iniciar sesión · Volá!",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center gap-6 py-10">
      <SpeedTrail />
      <div className="mx-auto flex w-full max-w-[25rem] flex-col gap-10 px-4">
        <Logo tone="tinta" size="grande" />
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Entrá a tu panel</h1>
          <LoginForm />
        </div>
        {/* <p className="text-sm text-muted-foreground">
          ¿No podés entrar? Pedí ayuda a tu administrador.
        </p> */}
      </div>
    </main>
  );
}
