ALTER TABLE "drivers" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "location_accuracy_meters" double precision;--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "location_recorded_at" timestamp;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_location_complete" CHECK (("latitude" IS NULL) = ("longitude" IS NULL) AND ("latitude" IS NULL) = ("location_recorded_at" IS NULL));