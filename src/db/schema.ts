import {
  pgTable,
  text,
  timestamp,
  uuid,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

import type { UIMessage } from "ai";

export const db = drizzle(process.env.DATABASE_URL!);

export const appsTable = pgTable("apps", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Unnamed App"),
  description: text("description").notNull().default("No description"),
  gitRepo: text("git_repo").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  baseId: text("base_id").notNull().default("nextjs-dkjfgdf"),
  previewDomain: text("preview_domain").unique(),
});

export const appPermissions = pgEnum("app_user_permission", [
  "read",
  "write",
  "admin",
]);

export const appUsers = pgTable("app_users", {
  userId: text("user_id").notNull(),
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  permissions: appPermissions("permissions"),
  freestyleIdentity: text("freestyle_identity").notNull(),
  freestyleAccessToken: text("freestyle_access_token").notNull(),
  freestyleAccessTokenId: text("freestyle_access_token_id").notNull(),
});

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id),
  message: json("message").notNull().$type<UIMessage>(),
});

export const appDeployments = pgTable("app_deployments", {
  appId: uuid("app_id")
    .notNull()
    .references(() => appsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deploymentId: text("deployment_id").notNull(),
  commit: text("commit").notNull(), // sha of the commit
});

// Mapping for external voice agent: phone number -> user identity
// Note: Populate this table out-of-band when a user links their phone.
export const userPhones = pgTable("user_phones", {
  phoneNumber: text("phone_number").primaryKey(),
  userId: text("user_id").notNull(),
  freestyleIdentity: text("freestyle_identity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
