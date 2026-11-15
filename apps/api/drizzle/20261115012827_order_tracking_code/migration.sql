ALTER TABLE "orders" ADD COLUMN "tracking_code" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tracking_code_key" UNIQUE("tracking_code");