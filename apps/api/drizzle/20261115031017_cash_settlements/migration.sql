CREATE TYPE "settlement_types" AS ENUM('driver_to_platform', 'driver_to_merchant', 'platform_to_merchant');--> statement-breakpoint
CREATE TABLE "cash_settlements" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cash_settlements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "settlement_types" NOT NULL,
	"driver_id" bigint,
	"organization_id" bigint,
	"amount" numeric(12,2) NOT NULL,
	"settled_by_user_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cash_settlements_amount_positive" CHECK ("amount" > 0),
	CONSTRAINT "cash_settlements_parties_match_type" CHECK (CASE "type"
        WHEN 'driver_to_platform' THEN "driver_id" IS NOT NULL AND "organization_id" IS NULL
        WHEN 'driver_to_merchant' THEN "driver_id" IS NOT NULL AND "organization_id" IS NOT NULL
        WHEN 'platform_to_merchant' THEN "driver_id" IS NULL AND "organization_id" IS NOT NULL
      END)
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_settlement_id" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "merchant_settlement_id" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_settlement_id_cash_settlements_id_fkey" FOREIGN KEY ("driver_settlement_id") REFERENCES "cash_settlements"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_merchant_settlement_id_cash_settlements_id_fkey" FOREIGN KEY ("merchant_settlement_id") REFERENCES "cash_settlements"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cash_settlements" ADD CONSTRAINT "cash_settlements_driver_id_drivers_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cash_settlements" ADD CONSTRAINT "cash_settlements_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "cash_settlements" ADD CONSTRAINT "cash_settlements_settled_by_user_id_users_id_fkey" FOREIGN KEY ("settled_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_key_known", ADD CONSTRAINT "role_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage', 'orders.create', 'drivers.manage', 'orders.assign', 'orders.manage', 'cash.settle'));--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_key_known", ADD CONSTRAINT "user_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage', 'orders.create', 'drivers.manage', 'orders.assign', 'orders.manage', 'cash.settle'));