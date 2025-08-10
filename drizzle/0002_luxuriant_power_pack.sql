ALTER TABLE "app_users" ALTER COLUMN "permissions" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "app_users" ALTER COLUMN "permissions" SET NOT NULL;