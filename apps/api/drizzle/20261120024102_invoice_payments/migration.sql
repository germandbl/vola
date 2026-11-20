ALTER TABLE "invoices" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_by_user_id" bigint;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paid_by_user_id_users_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paid_together" CHECK (("paid_at" IS NULL) = ("paid_by_user_id" IS NULL));