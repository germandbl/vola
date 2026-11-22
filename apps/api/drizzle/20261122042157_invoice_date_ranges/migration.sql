-- Las facturas que ya existan toman su rango antes de que las columnas pasen a ser obligatorias.
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_organization_id_period_starts_on_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_period_only_for_software";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "period_start" date;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "period_end" date;--> statement-breakpoint
UPDATE "invoices" SET "period_start" = "period_starts_on", "period_end" = ("period_starts_on" + interval '1 month' - interval '1 day')::date WHERE "type" = 'software';--> statement-breakpoint
UPDATE "invoices" SET
  "period_start" = coalesce((SELECT min("status_changed_at" - interval '6 hours')::date FROM "orders" WHERE "orders"."invoice_id" = "invoices"."id"), ("created_at" - interval '6 hours')::date),
  "period_end" = coalesce((SELECT max("status_changed_at" - interval '6 hours')::date FROM "orders" WHERE "orders"."invoice_id" = "invoices"."id"), ("created_at" - interval '6 hours')::date)
WHERE "type" = 'delivery';--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "software_invoice_details" ADD COLUMN "month_fraction" numeric(10,6) NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE "software_invoice_details" ADD COLUMN "prorated_monthly_fee" numeric(12,2);--> statement-breakpoint
ALTER TABLE "software_invoice_details" ADD COLUMN "prorated_included_orders" integer;--> statement-breakpoint
UPDATE "software_invoice_details" SET "prorated_monthly_fee" = "monthly_fee", "prorated_included_orders" = "included_orders";--> statement-breakpoint
ALTER TABLE "software_invoice_details" ALTER COLUMN "month_fraction" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "software_invoice_details" ALTER COLUMN "prorated_monthly_fee" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "software_invoice_details" ALTER COLUMN "prorated_included_orders" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "period_starts_on";--> statement-breakpoint
CREATE INDEX "invoices_organization_type_period_index" ON "invoices" ("organization_id","type","period_start");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_period_in_order" CHECK ("period_start" <= "period_end");--> statement-breakpoint
ALTER TABLE "software_invoice_details" ADD CONSTRAINT "software_invoice_details_month_fraction_positive" CHECK ("month_fraction" > 0);--> statement-breakpoint
ALTER TABLE "software_invoice_details" DROP CONSTRAINT "software_invoice_details_counts_not_negative", ADD CONSTRAINT "software_invoice_details_counts_not_negative" CHECK ("order_count" >= 0 AND "extra_order_count" >= 0 AND "included_orders" >= 0 AND "prorated_included_orders" >= 0);
