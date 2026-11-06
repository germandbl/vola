import "server-only";
import {
  countrySchema,
  deliveryFeeRateSchema,
  organizationSchema,
  userSummarySchema,
  type Country,
  type DeliveryFeeRate,
  type Organization,
  type Paginated,
  type UserSummary,
} from "@vola/shared";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { z, type ZodType } from "zod";
import { fetchWithSession } from "./api-fetch";

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

function paginatedSchema<T>(itemSchema: ZodType<T>): ZodType<Paginated<T>> {
  return z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  });
}

async function getFromApi<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetchWithSession(path);
  if (response.status === HTTP_UNAUTHORIZED) redirect("/login");
  // No revelamos si una organización existe a quien no tiene acceso a ella.
  if (response.status === HTTP_FORBIDDEN) notFound();
  if (response.status === HTTP_NOT_FOUND) notFound();
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return schema.parse(await response.json());
}

export function getOrganizationsPage(
  page: number,
): Promise<Paginated<Organization>> {
  return getFromApi(
    `/organizations?page=${page}`,
    paginatedSchema(organizationSchema),
  );
}

// El layout de pestañas y cada pestaña piden la misma organización; cache evita repetir la llamada en un mismo render.
export const getOrganization = cache((organizationId: number): Promise<Organization> => {
  return getFromApi(`/organizations/${organizationId}`, organizationSchema);
});

export function getOrganizationUsersPage(
  organizationId: number,
  page: number,
): Promise<Paginated<UserSummary>> {
  return getFromApi(
    `/organizations/${organizationId}/users?page=${page}`,
    paginatedSchema(userSummarySchema),
  );
}

export function getDeliveryFeeRate(organizationId: number): Promise<DeliveryFeeRate> {
  return getFromApi(
    `/organizations/${organizationId}/delivery-fee-rate`,
    deliveryFeeRateSchema,
  );
}

export function getCountries(): Promise<Country[]> {
  return getFromApi("/countries", z.array(countrySchema));
}
