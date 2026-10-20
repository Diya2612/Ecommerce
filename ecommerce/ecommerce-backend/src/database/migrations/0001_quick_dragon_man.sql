CREATE TABLE "user_notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "account_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "account_status" SET DEFAULT 'active'::text;--> statement-breakpoint
DROP TYPE "public"."customer_account_status";--> statement-breakpoint
CREATE TYPE "public"."customer_account_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "account_status" SET DEFAULT 'active'::"public"."customer_account_status";--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "account_status" SET DATA TYPE "public"."customer_account_status" USING "account_status"::"public"."customer_account_status";--> statement-breakpoint
DROP INDEX "customer_profiles_status_idx";--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" DROP COLUMN "banned_reason";--> statement-breakpoint
ALTER TABLE "customer_profiles" DROP COLUMN "banned_until";