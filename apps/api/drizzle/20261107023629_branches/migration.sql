CREATE TYPE "days_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "branch_opening_hours" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branch_opening_hours_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"branch_id" bigint NOT NULL,
	"day" "days_of_week" NOT NULL,
	"is_open" boolean NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branch_opening_hours_branch_id_day_unique" UNIQUE("branch_id","day"),
	CONSTRAINT "branch_opening_hours_consistent" CHECK (("is_open" AND "opens_at" IS NOT NULL AND "closes_at" IS NOT NULL AND "closes_at" > "opens_at")
        OR (NOT "is_open" AND "opens_at" IS NULL AND "closes_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branches_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"merchant_id" bigint NOT NULL,
	"name" varchar NOT NULL,
	"address" varchar NOT NULL,
	"latitude" numeric(9,6) NOT NULL,
	"longitude" numeric(9,6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "branches_merchant_id_name_unique" UNIQUE("merchant_id","name"),
	CONSTRAINT "branches_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "branches_address_not_blank" CHECK (btrim("address") <> ''),
	CONSTRAINT "branches_latitude_in_range" CHECK ("latitude" BETWEEN -90 AND 90),
	CONSTRAINT "branches_longitude_in_range" CHECK ("longitude" BETWEEN -180 AND 180)
);
--> statement-breakpoint
ALTER TABLE "branch_opening_hours" ADD CONSTRAINT "branch_opening_hours_branch_id_branches_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_merchant_id_merchants_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE;