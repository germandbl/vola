CREATE TYPE "invoice_types" AS ENUM('delivery', 'software');--> statement-breakpoint
CREATE TABLE "software_invoice_details" (
	"invoice_id" bigint PRIMARY KEY,
	"contract_currency" varchar(3) NOT NULL,
	"monthly_fee" numeric(12,2) NOT NULL,
	"included_orders" integer NOT NULL,
	"extra_order_fee" numeric(12,2) NOT NULL,
	"order_count" integer NOT NULL,
	"extra_order_count" integer NOT NULL,
	"subtotal" numeric(12,2) NOT NULL,
	"exchange_rate" numeric(14,6) NOT NULL,
	CONSTRAINT "software_invoice_details_exchange_rate_positive" CHECK ("exchange_rate" > 0),
	CONSTRAINT "software_invoice_details_counts_not_negative" CHECK ("order_count" >= 0 AND "extra_order_count" >= 0 AND "included_orders" >= 0)
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "type" "invoice_types" DEFAULT 'delivery'::"invoice_types" NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "period_starts_on" date;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_period_starts_on_unique" UNIQUE("organization_id","period_starts_on");--> statement-breakpoint
ALTER TABLE "software_invoice_details" ADD CONSTRAINT "software_invoice_details_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_period_only_for_software" CHECK (("type" = 'software') = ("period_starts_on" IS NOT NULL));