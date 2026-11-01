DROP TABLE "user_organizations";--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" ADD CONSTRAINT "driver_merchant_assignments_driver_id_organization_id_unique" UNIQUE("driver_id","organization_id");--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_permission_key_unique" UNIQUE("role_id","permission_key");--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_user_id_unique" UNIQUE("team_id","user_id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_name_unique" UNIQUE("organization_id","name");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_permission_key_unique" UNIQUE("user_id","permission_key");--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_name_key" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_code_key" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_key" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_key" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" DROP CONSTRAINT "driver_merchant_assignments_driver_id_drivers_id_fkey", ADD CONSTRAINT "driver_merchant_assignments_driver_id_drivers_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_merchant_assignments" DROP CONSTRAINT "driver_merchant_assignments_FrXDMPggKPSV_fkey", ADD CONSTRAINT "driver_merchant_assignments_FrXDMPggKPSV_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_user_id_users_id_fkey", ADD CONSTRAINT "drivers_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_country_id_countries_id_fkey", ADD CONSTRAINT "drivers_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_country_id_countries_id_fkey", ADD CONSTRAINT "organizations_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_roles_id_fkey", ADD CONSTRAINT "role_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_user_id_users_id_fkey", ADD CONSTRAINT "team_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_teams_id_fkey", ADD CONSTRAINT "team_members_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_organization_id_organizations_id_fkey", ADD CONSTRAINT "teams_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_user_id_users_id_fkey", ADD CONSTRAINT "user_permissions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fkey", ADD CONSTRAINT "users_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_organizations_id_fkey", ADD CONSTRAINT "users_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fkey", ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_expires_after_created" CHECK ("expires_at" > "created_at");--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_code_iso" CHECK ("code" ~ '^[A-Z]{2}$');--> statement-breakpoint
ALTER TABLE "countries" ADD CONSTRAINT "countries_currency_iso" CHECK ("currency" ~ '^[A-Z]{3}$');--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_name_not_blank" CHECK (btrim("name") <> '');--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_name_known" CHECK ("name" IN ('superadmin', 'administrator', 'agent', 'driver'));--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_name_not_blank" CHECK (btrim("name") <> '');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_not_blank" CHECK (btrim("name") <> '');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK ("email" = lower("email"));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_not_blank" CHECK (btrim("phone_number") <> '');