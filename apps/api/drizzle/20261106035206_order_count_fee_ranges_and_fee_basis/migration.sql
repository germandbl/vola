CREATE TYPE "delivery_fee_bases" AS ENUM('distance', 'completed_orders');--> statement-breakpoint
CREATE TABLE "order_count_fee_ranges" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_count_fee_ranges_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"organization_id" bigint NOT NULL,
	"up_to_order_count" integer,
	"fee" numeric(10,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_count_fee_ranges_organization_id_up_to_order_count_unique" UNIQUE NULLS NOT DISTINCT("organization_id","up_to_order_count"),
	CONSTRAINT "order_count_fee_ranges_up_to_order_count_positive" CHECK ("up_to_order_count" > 0),
	CONSTRAINT "order_count_fee_ranges_fee_not_negative" CHECK ("fee" >= 0)
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "delivery_fee_basis" "delivery_fee_bases";--> statement-breakpoint
ALTER TABLE "order_count_fee_ranges" ADD CONSTRAINT "order_count_fee_ranges_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;