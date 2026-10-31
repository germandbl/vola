import { Suspense } from "react";
import { Greeting, GreetingSkeleton } from "@/components/dashboard/Greeting";
import { WelcomeEmptyState } from "@/components/dashboard/WelcomeEmptyState";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting />
      </Suspense>
      <WelcomeEmptyState />
    </div>
  );
}
