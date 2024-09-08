CREATE TABLE IF NOT EXISTS "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"phone_number" text,
	"system_prompt" text,
	"voice_type" text,
	"call_history" jsonb,
	"custom_responses" jsonb,
	"minutes_used" numeric DEFAULT '0',
	"retell_agent_id" text,
	"llm_websocket_url" text,
	"llm_id" text,
	"agent_name" text,
	"voice_id" text,
	"voice_model" text,
	"fallback_voice_ids" jsonb,
	"voice_temperature" numeric,
	"voice_speed" numeric,
	"responsiveness" numeric,
	"interruption_sensitivity" numeric,
	"enable_backchannel" boolean,
	"backchannel_frequency" numeric,
	"backchannel_words" jsonb,
	"reminder_trigger_ms" numeric,
	"reminder_max_count" numeric,
	"ambient_sound" text,
	"ambient_sound_volume" numeric,
	"language" text,
	"webhook_url" text,
	"boosted_keywords" jsonb,
	"opt_out_sensitive_data_storage" boolean,
	"pronunciation_dictionary" jsonb,
	"normalize_for_speech" boolean,
	"end_call_after_silence_ms" numeric,
	"enable_voicemail_detection" boolean,
	"voicemail_message" text,
	"post_call_analysis_data" jsonb,
	"last_modification_timestamp" numeric,
	"area_code" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"agent_id" uuid NOT NULL,
	"minutes_used" numeric NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"stripe_customer_id" text,
	"phone_numbers" jsonb DEFAULT '[]',
	"is_yearly" boolean DEFAULT false,
	"stripe_price_id" text,
	"subscription_name" text,
	"subscription_status" text,
	"stripe_subscription_id" text,
	"subscription_cancel_at" timestamp,
	"stripe_current_period_end" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
