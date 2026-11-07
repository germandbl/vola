CREATE TYPE "order_statuses" AS ENUM('new', 'preparing', 'on_the_way', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL,
	"name" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_organization_id_phone_number_unique" UNIQUE("organization_id","phone_number"),
	CONSTRAINT "customers_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "customers_phone_number_not_blank" CHECK (btrim("phone_number") <> '')
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_id" bigint NOT NULL,
	"name" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "order_items_unit_price_not_negative" CHECK ("unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL,
	"branch_id" bigint NOT NULL,
	"customer_id" bigint NOT NULL,
	"created_by_user_id" bigint NOT NULL,
	"status" "order_statuses" DEFAULT 'new'::"order_statuses" NOT NULL,
	"delivery_address" varchar NOT NULL,
	"delivery_latitude" numeric(9,6) NOT NULL,
	"delivery_longitude" numeric(9,6) NOT NULL,
	"subtotal" numeric(10,2) NOT NULL,
	"customer_delivery_fee" numeric(10,2) NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"vola_delivery_fee" numeric(10,2) NOT NULL,
	"delivery_fee_basis" "delivery_fee_bases" NOT NULL,
	"distance_km" numeric(7,2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_delivery_address_not_blank" CHECK (btrim("delivery_address") <> ''),
	CONSTRAINT "orders_amounts_not_negative" CHECK ("subtotal" >= 0 AND "customer_delivery_fee" >= 0 AND "vola_delivery_fee" >= 0),
	CONSTRAINT "orders_total_matches" CHECK ("total" = "subtotal" + "customer_delivery_fee")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_key_known", ADD CONSTRAINT "role_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage', 'orders.create'));--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permission_key_known", ADD CONSTRAINT "user_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage', 'merchants.manage', 'orders.create'));