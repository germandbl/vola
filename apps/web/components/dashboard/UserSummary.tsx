import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/current-user";

function getInitials(name: string): string {
  const [firstName = "", lastName = ""] = name.trim().split(/\s+/);
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export async function UserSummary() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-2 px-2">
      <Avatar size="lg">
        <AvatarFallback className="bg-cielo font-semibold text-tinta">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-sm text-nube">{user.email}</span>
      </div>
    </div>
  );
}

export function UserSummarySkeleton() {
  return (
    <div className="flex items-center gap-2 px-2">
      <Skeleton className="size-10 shrink-0 rounded-full bg-sidebar-border" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-3/4 bg-sidebar-border" />
        <Skeleton className="h-3 w-1/2 bg-sidebar-border" />
      </div>
    </div>
  );
}
