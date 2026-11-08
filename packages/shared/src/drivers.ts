import { z } from "zod";
import { userFormSchema } from "./users.js";

export const driverFormSchema = userFormSchema.omit({ role: true });

export type DriverForm = z.infer<typeof driverFormSchema>;

export const driverSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  createdAt: z.string(),
});

export type DriverSummary = z.infer<typeof driverSummarySchema>;
