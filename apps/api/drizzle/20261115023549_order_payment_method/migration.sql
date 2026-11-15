CREATE TYPE "payment_methods" AS ENUM('card', 'cash');--> statement-breakpoint
-- Las órdenes que ya existen quedan en efectivo: hasta ahora el motorista cobraba todo al entregar.
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_methods" DEFAULT 'cash' NOT NULL;--> statement-breakpoint
-- Sin valor por defecto: cada orden nueva tiene que decir cómo paga el cliente.
ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP DEFAULT;
