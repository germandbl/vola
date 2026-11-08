import "server-only";
import {
  branchSchema,
  branchSummarySchema,
  countrySchema,
  deliveryFeeBasisSettingSchema,
  deliveryFeeRateSchema,
  driverSummarySchema,
  merchantSchema,
  orderBranchOptionSchema,
  orderCountFeeRateSchema,
  orderSummarySchema,
  organizationSchema,
  userSummarySchema,
  type Branch,
  type BranchSummary,
  type Country,
  type DeliveryFeeBasisSetting,
  type DeliveryFeeRate,
  type DriverSummary,
  type Merchant,
  type OrderBranchOption,
  type OrderCountFeeRate,
  type OrderSummary,
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

export function getMerchants(organizationId: number): Promise<Merchant[]> {
  return getFromApi(`/organizations/${organizationId}/merchants`, z.array(merchantSchema));
}

export const getMerchant = cache((merchantId: number): Promise<Merchant> => {
  return getFromApi(`/merchants/${merchantId}`, merchantSchema);
});

export function getBranches(merchantId: number): Promise<BranchSummary[]> {
  return getFromApi(`/merchants/${merchantId}/branches`, z.array(branchSummarySchema));
}

export function getBranch(branchId: number): Promise<Branch> {
  return getFromApi(`/branches/${branchId}`, branchSchema);
}

export function getDeliveryFeeRate(merchantId: number): Promise<DeliveryFeeRate> {
  return getFromApi(
    `/merchants/${merchantId}/delivery-fee-rate`,
    deliveryFeeRateSchema,
  );
}

export function getOrderCountFeeRate(merchantId: number): Promise<OrderCountFeeRate> {
  return getFromApi(
    `/merchants/${merchantId}/order-count-fee-rate`,
    orderCountFeeRateSchema,
  );
}

export function getDeliveryFeeBasis(merchantId: number): Promise<DeliveryFeeBasisSetting> {
  return getFromApi(
    `/merchants/${merchantId}/delivery-fee-basis`,
    deliveryFeeBasisSettingSchema,
  );
}

export function getCountries(): Promise<Country[]> {
  return getFromApi("/countries", z.array(countrySchema));
}

export async function getOrganizationMerchant(
  organizationId: number,
  merchantId: number,
): Promise<{ organization: Organization; merchant: Merchant }> {
  const [organization, merchant] = await Promise.all([
    getOrganization(organizationId),
    getMerchant(merchantId),
  ]);
  // La URL trae los dos ids; si el comercio es de otra organización, la ruta no existe.
  if (merchant.organizationId !== organization.id) notFound();
  return { organization, merchant };
}

export function getOrdersPage(page: number): Promise<Paginated<OrderSummary>> {
  return getFromApi(`/orders?page=${page}`, paginatedSchema(orderSummarySchema));
}

export function getOrderBranchOptions(): Promise<OrderBranchOption[]> {
  return getFromApi("/orders/branch-options", z.array(orderBranchOptionSchema));
}

export function getOwnDrivers(): Promise<DriverSummary[]> {
  return getFromApi("/drivers", z.array(driverSummarySchema));
}
