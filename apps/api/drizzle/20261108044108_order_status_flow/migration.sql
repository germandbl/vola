ALTER TYPE "order_statuses" ADD VALUE 'heading_to_branch' BEFORE 'on_the_way';--> statement-breakpoint
ALTER TYPE "order_statuses" ADD VALUE 'at_branch' BEFORE 'on_the_way';--> statement-breakpoint
CREATE TABLE "order_status_changes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_status_changes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"order_id" bigint NOT NULL,
	"status" "order_statuses" NOT NULL,
	"cancellation_reason" varchar,
	"changed_by_user_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_status_changes_cancellation_reason_only_when_cancelled" CHECK (("status" = 'cancelled') = ("cancellation_reason" IS NOT NULL)),
	CONSTRAINT "order_status_changes_cancellation_reason_not_blank" CHECK (btrim("cancellation_reason") <> '')
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status_changed_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
-- Las órdenes que ya existen no cambiaron de estado desde que se crearon.
UPDATE "orders" SET "status_changed_at" = "created_at";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancellation_reason" varchar;--> statement-breakpoint
ALTER TABLE "order_status_changes" ADD CONSTRAINT "order_status_changes_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_status_changes" ADD CONSTRAINT "order_status_changes_changed_by_user_id_users_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cancellation_reason_only_when_cancelled" CHECK (("status" = 'cancelled') = ("cancellation_reason" IS NOT NULL));