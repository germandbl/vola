import { z } from "zod";
import { driverMapLocationSchema } from "./drivers.js";
import { orderStatusSchema } from "./orders.js";

export const operationMapOrderSchema = z.object({
  id: z.number(),
  status: orderStatusSchema,
  customerName: z.string(),
  merchantName: z.string(),
  branchName: z.string(),
  driverName: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
});

export type OperationMapOrder = z.infer<typeof operationMapOrderSchema>;

export const operationMapBranchSchema = z.object({
  id: z.number(),
  name: z.string(),
  merchantName: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type OperationMapBranch = z.infer<typeof operationMapBranchSchema>;

// Cada capa respeta su propio permiso: quien no gestiona motoristas recibe la lista de motoristas vacía.
export const operationMapSchema = z.object({
  drivers: z.array(driverMapLocationSchema),
  orders: z.array(operationMapOrderSchema),
  branches: z.array(operationMapBranchSchema),
});

export type OperationMap = z.infer<typeof operationMapSchema>;
