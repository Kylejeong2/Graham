// used to create tables in the postgres schema
// to make changes run this: npx drizzle-kit generate || npx drizzle-kit migrate || npx drizzle-kit push
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core'

export const $agents = pgTable('agents', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: text('user_id').notNull(), 
    phoneNumber: text('phone_number'),
    systemPrompt: text('system_prompt'),
    isActive: boolean('is_active').default(false),
    businessHours: jsonb('business_hours'),
    voiceType: text('voice_type'),
    callHistory: jsonb('call_history'),
    customResponses: jsonb('custom_responses'),
});

export type AgentType = typeof $agents.$inferInsert;