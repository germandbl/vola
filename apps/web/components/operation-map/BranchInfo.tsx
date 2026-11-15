import type { OperationMapBranch } from "@vola/shared";

interface BranchInfoProps {
  branch: OperationMapBranch;
}

export function BranchInfo({ branch }: BranchInfoProps) {
  return (
    <div className="flex min-w-48 flex-col gap-1 text-sm text-tinta">
      <p>{branch.merchantName}</p>
      <p className="text-muted-foreground">{branch.address}</p>
    </div>
  );
}
