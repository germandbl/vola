import { z } from "zod";
import { userFormSchema } from "./users.js";

const merchantIdsSchema = z
  .array(z.number().int().positive())
  .min(1, "Elegí al menos un comercio que atienda.");

export const driverFormSchema = userFormSchema.omit({ role: true }).extend({
  organizationId: z
    .number({ error: "Elegí a quién pertenece el motorista." })
    .int()
    .positive("Elegí a quién pertenece el motorista."),
  merchantIds: merchantIdsSchema,
});

export type DriverForm = z.infer<typeof driverFormSchema>;

export const driverMerchantsFormSchema = z.object({
  merchantIds: merchantIdsSchema,
});

export type DriverMerchantsForm = z.infer<typeof driverMerchantsFormSchema>;

export const driverMerchantSchema = z.object({
  id: z.number(),
  name: z.string(),
  organizationId: z.number(),
  organizationName: z.string(),
});

export type DriverMerchant = z.infer<typeof driverMerchantSchema>;

export const driverOwnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  isPlatform: z.boolean(),
});

export type DriverOwner = z.infer<typeof driverOwnerSchema>;

export const driverSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  owner: driverOwnerSchema,
  merchants: z.array(driverMerchantSchema),
  isAvailable: z.boolean(),
  createdAt: z.string(),
});

export type DriverSummary = z.infer<typeof driverSummarySchema>;

// Un motorista de un cliente solo atiende comercios de ese cliente; uno de la plataforma, los de cualquier cliente.
export function canDriverServeMerchant(
  owner: DriverOwner,
  merchant: DriverMerchant,
): boolean {
  if (owner.isPlatform) return true;
  return merchant.organizationId === owner.id;
}

export const driverAvailabilityFormSchema = z.object({
  isAvailable: z.boolean(),
});

export type DriverAvailabilityForm = z.infer<typeof driverAvailabilityFormSchema>;

export const driverProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  isAvailable: z.boolean(),
});

export type DriverProfile = z.infer<typeof driverProfileSchema>;
