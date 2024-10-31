CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"stop_loss_amount" numeric
);
--> statement-breakpoint
ALTER TABLE "usage_records" ADD COLUMN "seconds_used" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "usage_records" ADD COLUMN "voice_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_plan_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number_subscription_data" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
