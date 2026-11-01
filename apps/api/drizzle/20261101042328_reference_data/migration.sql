INSERT INTO "roles" ("name") VALUES
  ('superadmin'),
  ('administrator'),
  ('agent'),
  ('driver')
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "countries" ("name", "code", "currency") VALUES
  ('Guatemala', 'GT', 'GTQ'),
  ('Belice', 'BZ', 'BZD'),
  ('Honduras', 'HN', 'HNL'),
  ('El Salvador', 'SV', 'USD'),
  ('Nicaragua', 'NI', 'NIO'),
  ('Costa Rica', 'CR', 'CRC'),
  ('Panamá', 'PA', 'USD')
ON CONFLICT ("code") DO NOTHING;
