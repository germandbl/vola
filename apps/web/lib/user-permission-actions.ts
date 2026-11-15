"use server";

import type { AgentPermissionsForm } from "@vola/shared";
import { refresh } from "next/cache";
import { fetchWithSession } from "./api-fetch";

const HTTP_FORBIDDEN = 403;

export interface PermissionsSaveResult {
  error?: string;
  isSaved?: boolean;
}

export async function updateAgentPermissions(
  organizationId: number,
  userId: number,
  form: AgentPermissionsForm,
): Promise<PermissionsSaveResult> {
  const response = await fetchWithSession(`/organizations/${organizationId}/users/${userId}/permissions`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  if (response.status === HTTP_FORBIDDEN) {
    return { error: "No tenés permiso para cambiar los permisos de esta organización." };
  }
  if (!response.ok) return { error: "No pudimos guardar los permisos. Probá de nuevo en un momento." };
  refresh();
  return { isSaved: true };
}
