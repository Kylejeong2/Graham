// used to create tables in the postgres schema
// to make changes run this: npx drizzle-kit generate || npx drizzle-kit migrate || npx drizzle-kit push
import { pgTable, text, timestamp, uuid, boolean, jsonb, numeric, foreignKey } from 'drizzle-orm/pg-core'

export const $agents = pgTable('agents', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: text('user_id').notNull().references(() => $users.id), 
    phoneNumber: text('phone_number'),
    systemPrompt: text('system_prompt'),
    voiceType: text('voice_type'),
    callHistory: jsonb('call_history'),
    customResponses: jsonb('custom_responses'),
    minutesUsed: numeric('minutes_used').default('0'),
    retellAgentId: text('retell_agent_id'),
    llmWebsocketUrl: text('llm_websocket_url'),
    llmId: text('llm_id'),
    agentName: text('agent_name'),
    voiceId: text('voice_id'),
    voiceModel: text('voice_model'),
    fallbackVoiceIds: jsonb('fallback_voice_ids'),
    voiceTemperature: numeric('voice_temperature'),
    voiceSpeed: numeric('voice_speed'),
    responsiveness: numeric('responsiveness'),
    interruptionSensitivity: numeric('interruption_sensitivity'),
    enableBackchannel: boolean('enable_backchannel'),
    backchannelFrequency: numeric('backchannel_frequency'),
    backchannelWords: jsonb('backchannel_words'),
    reminderTriggerMs: numeric('reminder_trigger_ms'),
    reminderMaxCount: numeric('reminder_max_count'),
    ambientSound: text('ambient_sound'),
    ambientSoundVolume: numeric('ambient_sound_volume'),
    language: text('language'),
    webhookUrl: text('webhook_url'),
    boostedKeywords: jsonb('boosted_keywords'),
    optOutSensitiveDataStorage: boolean('opt_out_sensitive_data_storage'),
    pronunciationDictionary: jsonb('pronunciation_dictionary'),
    normalizeForSpeech: boolean('normalize_for_speech'),
    endCallAfterSilenceMs: numeric('end_call_after_silence_ms'),
    enableVoicemailDetection: boolean('enable_voicemail_detection'),
    voicemailMessage: text('voicemail_message'),
    postCallAnalysisData: jsonb('post_call_analysis_data'),
    lastModificationTimestamp: numeric('last_modification_timestamp'),
    areaCode: text('area_code'),
});

export const $usageRecords = pgTable('usage_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => $users.id),
    agentId: uuid('agent_id').notNull().references(() => $agents.id),
    minutesUsed: numeric('minutes_used').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const $users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
    stripeCustomerId: text('stripe_customer_id'),
    phoneNumbers: jsonb('phone_numbers').default('[]'),
});

export const $waitlist = pgTable('waitlist', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const $leads = pgTable('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    phoneNumber: text('phone_number').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AgentType = typeof $agents.$inferInsert;
export type UsageRecordType = typeof $usageRecords.$inferInsert;
export type UserType = typeof $users.$inferInsert;
export type WaitlistType = typeof $waitlist.$inferInsert;
export type LeadType = typeof $leads.$inferInsert;