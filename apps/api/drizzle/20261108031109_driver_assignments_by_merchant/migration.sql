-- Las asignaciones pasan de la organización a cada comercio: cada asignación actual se convierte en una por cada comercio de esa organización.
ALTER TABLE "driver_merchant_assignments" DROP CONSTRAINT "driver_merchant_assignments_FrXDMPggKPSV_fkey";--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" DROP CONSTRAINT "driver_merchant_assignments_driver_id_organization_id_unique";--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" ADD COLUMN "merchant_id" bigint;--> statement-breakpoint
INSERT INTO "driver_merchant_assignments" ("driver_id", "organization_id", "merchant_id")
SELECT "assignment"."driver_id", "assignment"."organization_id", "merchant"."id"
FROM "driver_merchant_assignments" AS "assignment"
INNER JOIN "merchants" AS "merchant" ON "merchant"."organization_id" = "assignment"."organization_id"
WHERE "assignment"."merchant_id" IS NULL;--> statement-breakpoint
DELETE FROM "driver_merchant_assignments" WHERE "merchant_id" IS NULL;--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" ALTER COLUMN "merchant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" ADD CONSTRAINT "driver_merchant_assignments_driver_id_merchant_id_unique" UNIQUE("driver_id","merchant_id");--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" ADD CONSTRAINT "driver_merchant_assignments_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;
