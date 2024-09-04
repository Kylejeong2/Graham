// used to create tables in the postgres schema
// to make changes run this: npx drizzle-kit generate || npx drizzle-kit migrate || npx drizzle-kit push
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, boolean, jsonb, numeric, foreignKey } from 'drizzle-orm/pg-core'

export const $agents = pgTable('agents', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: text('user_id').notNull().references(() => $users.id), 
    phoneNumber: numeric('phone_number'),
    systemPrompt: text('system_prompt'),
    isActive: boolean('is_active').default(false),
    businessHours: jsonb('business_hours'),
    voiceType: text('voice_type'),
    callHistory: jsonb('call_history'),
    customResponses: jsonb('custom_responses'),
    minutesUsed: numeric('minutes_used').default('0'),
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
});

export type AgentType = typeof $agents.$inferInsert;