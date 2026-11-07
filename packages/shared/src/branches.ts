import { z } from "zod";

export const DayOfWeek = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const dayOfWeekSchema = z.enum(DayOfWeek);

export const DAYS_OF_WEEK: DayOfWeek[] = Object.values(DayOfWeek);

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

const timeSchema = z
  .string({ error: "Escribí la hora." })
  .regex(TIME_PATTERN, "Escribí la hora como 08:00.");

export const openingHoursSchema = z.object({
  day: dayOfWeekSchema,
  isOpen: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
});

export type OpeningHours = z.infer<typeof openingHoursSchema>;

const openingHoursFormSchema = z
  .object({
    day: dayOfWeekSchema,
    isOpen: z.boolean(),
    opensAt: timeSchema.nullable(),
    closesAt: timeSchema.nullable(),
  })
  .superRefine((hours, context) => {
    if (!hours.isOpen) {
      if (hours.opensAt === null && hours.closesAt === null) return;
      context.addIssue({
        code: "custom",
        message: "Un día cerrado no lleva horario.",
        path: ["opensAt"],
      });
      return;
    }
    if (hours.opensAt === null) {
      context.addIssue({
        code: "custom",
        message: "Escribí la hora de apertura.",
        path: ["opensAt"],
      });
    }
    if (hours.closesAt === null) {
      context.addIssue({
        code: "custom",
        message: "Escribí la hora de cierre.",
        path: ["closesAt"],
      });
    }
    if (hours.opensAt === null || hours.closesAt === null) return;
    // Las horas van como HH:MM, así que compararlas como texto respeta el orden del día.
    if (hours.closesAt <= hours.opensAt) {
      context.addIssue({
        code: "custom",
        message: "La hora de cierre tiene que ser después de la apertura.",
        path: ["closesAt"],
      });
    }
  });

function hasEveryDayOnceInOrder(openingHours: { day: DayOfWeek }[]): boolean {
  return openingHours.every(
    (hours, index) => hours.day === DAYS_OF_WEEK[index],
  );
}

export const branchFormSchema = z.object({
  name: z.string().trim().min(1, "Escribí el nombre de la sucursal."),
  address: z.string().trim().min(1, "Escribí la dirección."),
  latitude: z
    .number({ error: "Escribí la latitud." })
    .min(MIN_LATITUDE, `La latitud va de ${MIN_LATITUDE} a ${MAX_LATITUDE}.`)
    .max(MAX_LATITUDE, `La latitud va de ${MIN_LATITUDE} a ${MAX_LATITUDE}.`),
  longitude: z
    .number({ error: "Escribí la longitud." })
    .min(
      MIN_LONGITUDE,
      `La longitud va de ${MIN_LONGITUDE} a ${MAX_LONGITUDE}.`,
    )
    .max(
      MAX_LONGITUDE,
      `La longitud va de ${MIN_LONGITUDE} a ${MAX_LONGITUDE}.`,
    ),
  openingHours: z
    .array(openingHoursFormSchema)
    .length(DAYS_OF_WEEK.length, "Completá el horario de los 7 días.")
    .refine(
      hasEveryDayOnceInOrder,
      "El horario tiene que ir de lunes a domingo.",
    ),
});

export type BranchForm = z.infer<typeof branchFormSchema>;

export const branchSummarySchema = z.object({
  id: z.number(),
  merchantId: z.number(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  createdAt: z.string(),
});

export type BranchSummary = z.infer<typeof branchSummarySchema>;

export const branchSchema = branchSummarySchema.extend({
  openingHours: z.array(openingHoursSchema),
});

export type Branch = z.infer<typeof branchSchema>;
