import { z } from "zod";
import { userFormSchema } from "./users.js";

const merchantIdsSchema = z
  .array(z.number().int().positive())
  .min(1, "Elegí al menos un comercio que atienda.");

export const driverFormSchema = userFormSchema
  .omit({ role: true })
  .extend({ merchantIds: merchantIdsSchema });

export type DriverForm = z.infer<typeof driverFormSchema>;

export const driverMerchantsFormSchema = z.object({
  merchantIds: merchantIdsSchema,
});

export type DriverMerchantsForm = z.infer<typeof driverMerchantsFormSchema>;

export const driverMerchantSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type DriverMerchant = z.infer<typeof driverMerchantSchema>;

export const driverSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  merchants: z.array(driverMerchantSchema),
  createdAt: z.string(),
});

export type DriverSummary = z.infer<typeof driverSummarySchema>;
