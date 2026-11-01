import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROW_COUNT = 5;

export function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}
