CREATE TYPE "public"."app_user_permission" AS ENUM('read', 'write', 'admin');--> statement-breakpoint
CREATE TABLE "app_deployments" (
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deployment_id" text NOT NULL,
	"commit" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"user_id" text NOT NULL,
	"app_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"permissions" "app_user_permission",
	"freestyle_identity" text NOT NULL,
	"freestyle_access_token" text NOT NULL,
	"freestyle_access_token_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'Unnamed App' NOT NULL,
	"description" text DEFAULT 'No description' NOT NULL,
	"git_repo" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"base_id" text DEFAULT 'nextjs-dkjfgdf' NOT NULL,
	"preview_domain" text,
	CONSTRAINT "apps_preview_domain_unique" UNIQUE("preview_domain")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"app_id" uuid NOT NULL,
	"message" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_phones" (
	"phone_number" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"freestyle_identity" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_deployments" ADD CONSTRAINT "app_deployments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;