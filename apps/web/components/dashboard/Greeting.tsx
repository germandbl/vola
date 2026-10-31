import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";

export async function Greeting() {
  const user = await getCurrentUser();
  const [firstName] = user.name.trim().split(/\s+/);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold md:text-4xl">Hola, {firstName}</h1>
      <p className="text-muted-foreground">Qué bueno verte por acá.</p>
    </div>
  );
}

export function GreetingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-44" />
    </div>
  );
}
