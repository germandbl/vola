CREATE TABLE "software_contracts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "software_contracts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL UNIQUE,
	"currency" varchar(3) NOT NULL,
	"starts_on" date NOT NULL,
	"monthly_fee" numeric(12,2) NOT NULL,
	"included_orders" integer NOT NULL,
	"extra_order_fee" numeric(12,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "software_contracts_currency_iso" CHECK ("currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "software_contracts_starts_on_first_day" CHECK (extract(day from "starts_on") = 1),
	CONSTRAINT "software_contracts_amounts_not_negative" CHECK ("monthly_fee" >= 0 AND "extra_order_fee" >= 0 AND "included_orders" >= 0)
);
--> statement-breakpoint
ALTER TABLE "software_contracts" ADD CONSTRAINT "software_contracts_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;