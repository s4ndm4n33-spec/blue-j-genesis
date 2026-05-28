import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gitRepos = pgTable("git_repos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  localPath: text("local_path").notNull(),
  branch: text("branch").notNull().default("main"),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertGitRepoSchema = createInsertSchema(gitRepos).omit({
  id: true,
  createdAt: true,
});

export type GitRepo = typeof gitRepos.$inferSelect;
export type InsertGitRepo = z.infer<typeof insertGitRepoSchema>;
