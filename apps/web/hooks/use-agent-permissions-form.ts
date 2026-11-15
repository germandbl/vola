import type { Permission } from "@vola/shared";
import { useState, useTransition } from "react";
import { updateAgentPermissions } from "@/lib/user-permission-actions";

interface AgentPermissionsTarget {
  organizationId: number;
  userId: number;
  currentPermissions: Permission[];
}

export function useAgentPermissionsForm({ organizationId, userId, currentPermissions }: AgentPermissionsTarget) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState(currentPermissions);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  // Al abrir se parte de lo guardado: si alguien cerró sin guardar, sus cambios no quedan a medias.
  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setError(undefined);
    if (nextIsOpen) setSelectedPermissions(currentPermissions);
  }

  function togglePermission(permission: Permission, isSelected: boolean) {
    setSelectedPermissions((current) => {
      const withoutPermission = current.filter((selected) => selected !== permission);
      return isSelected ? [...withoutPermission, permission] : withoutPermission;
    });
  }

  function save() {
    setError(undefined);
    startTransition(async () => {
      const result = await updateAgentPermissions(organizationId, userId, {
        permissions: selectedPermissions,
      });
      setError(result.error);
      if (result.isSaved) setIsOpen(false);
    });
  }

  return { isOpen, selectedPermissions, error, isPending, changeOpen, togglePermission, save };
}
