CREATE TABLE "delivery_fee_rate_ranges" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delivery_fee_rate_ranges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"rate_id" bigint NOT NULL,
	"up_to_km" numeric(6,2),
	"fee" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_fee_rate_ranges_rate_id_up_to_km_unique" UNIQUE NULLS NOT DISTINCT("rate_id","up_to_km"),
	CONSTRAINT "delivery_fee_rate_ranges_up_to_km_positive" CHECK ("up_to_km" > 0),
	CONSTRAINT "delivery_fee_rate_ranges_fee_not_negative" CHECK ("fee" >= 0)
);
--> statement-breakpoint
CREATE TABLE "delivery_fee_rates" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delivery_fee_rates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL UNIQUE,
	"extra_fee_per_km" numeric(10,2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_fee_rates_extra_fee_per_km_not_negative" CHECK ("extra_fee_per_km" >= 0)
);
--> statement-breakpoint
ALTER TABLE "delivery_fee_rate_ranges" ADD CONSTRAINT "delivery_fee_rate_ranges_rate_id_delivery_fee_rates_id_fkey" FOREIGN KEY ("rate_id") REFERENCES "delivery_fee_rates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "delivery_fee_rates" ADD CONSTRAINT "delivery_fee_rates_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage'));--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_key_known" CHECK ("permission_key" IN ('organizations.view', 'delivery_fees.manage'));