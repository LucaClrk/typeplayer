import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const scores = pgTable("scores", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    wpm: integer("wpm").notNull(),
    accuracy: integer("accuracy").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});
