// used to create tables in the postgres schema
// to make changes run this: npx drizzle-kit generate || npx drizzle-kit migrate || npx drizzle-kit push
import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const $compadres = pgTable('compadres', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    characteristics: text('characteristics').array().notNull().default(sql`ARRAY[]::text[]`),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    imageUrl: text('imageUrl'),
    userId: text('user_id').notNull(), // TODO: add daily room
});

export type CompadreType = typeof $compadres.$inferInsert;