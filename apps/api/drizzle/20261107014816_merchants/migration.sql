-- Las tarifas pasan de la organización a cada comercio. Se borran las existentes para configurarlas de nuevo por comercio.
DELETE FROM "delivery_fee_rates";--> statement-breakpoint
DELETE FROM "order_count_fee_ranges";--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "merchants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL,
	"name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"contact_email" varchar NOT NULL,
	"contact_phone" varchar NOT NULL,
	"delivery_fee_basis" "delivery_fee_bases",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchants_organization_id_name_unique" UNIQUE("organization_id","name"),
	CONSTRAINT "merchants_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "merchants_contact_name_not_blank" CHECK (btrim("contact_name") <> ''),
	CONSTRAINT "merchants_contact_email_lowercase" CHECK ("contact_email" = lower("contact_email")),
	CONSTRAINT "merchants_contact_phone_not_blank" CHECK (btrim("contact_phone") <> '')
);
--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" DROP CONSTRAINT "delivery_fee_rates_organization_id_organizations_id_fkey";--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" DROP CONSTRAINT "order_count_fee_ranges_organization_id_organizations_id_fkey";--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" DROP CONSTRAINT "order_count_fee_ranges_organization_id_up_to_order_count_unique";--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" DROP CONSTRAINT "delivery_fee_rates_organization_id_key";--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" ADD COLUMN "merchant_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" ADD COLUMN "merchant_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "delivery_fee_basis";--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" ADD CONSTRAINT "order_count_fee_ranges_merchant_id_up_to_order_count_unique" UNIQUE NULLS NOT DISTINCT("merchant_id","up_to_order_count");--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" ADD CONSTRAINT "delivery_fee_rates_merchant_id_key" UNIQUE("merchant_id");--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" ADD CONSTRAINT "delivery_fee_rates_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" ADD CONSTRAINT "order_count_fee_ranges_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_key_known", ADD CONSTRAINT "role_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage'));--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_key_known", ADD CONSTRAINT "user_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage'));