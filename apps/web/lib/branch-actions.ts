"use server";

import type { BranchForm } from "@vola/shared";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchWithSession } from "./api-fetch";
import { toFieldErrors, type FieldErrors } from "./form-state";

const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

const apiValidationErrorSchema = z.object({
  issues: z.array(
    z.object({ path: z.array(z.union([z.string(), z.number()])), message: z.string() }),
  ),
});

export interface BranchSaveResult {
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

async function toErrorResult(response: Response): Promise<BranchSaveResult> {
  if (response.status === HTTP_BAD_REQUEST) {
    const body = apiValidationErrorSchema.safeParse(await response.json());
    if (body.success) return { fieldErrors: toFieldErrors(body.data.issues) };
    return { fieldErrors: {}, formError: "Revisá los datos y probá de nuevo." };
  }
  if (response.status === HTTP_CONFLICT) {
    return { fieldErrors: { name: "Este comercio ya tiene una sucursal con ese nombre. Usá otro." } };
  }
  if (response.status === HTTP_FORBIDDEN) {
    return { fieldErrors: {}, formError: "No tenés permiso para gestionar sucursales." };
  }
  if (response.status === HTTP_NOT_FOUND) {
    return { fieldErrors: {}, formError: "No encontramos esta sucursal." };
  }
  return { fieldErrors: {}, formError: "No pudimos guardar. Probá de nuevo en un momento." };
}

export async function createBranch(
  organizationId: number,
  merchantId: number,
  form: BranchForm,
): Promise<BranchSaveResult> {
  const response = await fetchWithSession(`/merchants/${merchantId}/branches`, {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  redirect(`/organizaciones/${organizationId}/comercios/${merchantId}/sucursales`);
}

export async function updateBranch(branchId: number, form: BranchForm): Promise<BranchSaveResult> {
  const response = await fetchWithSession(`/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(form),
  });
  if (!response.ok) return toErrorResult(response);

  refresh();
  return { fieldErrors: {}, isSaved: true };
}
