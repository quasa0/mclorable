import { NextRequest } from "next/server";
import { db, appsTable, appUsers, userPhones } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const phoneFromBody = (body?.phone as string | undefined)?.trim();
  const phoneFromHeader = req.headers.get("X-User-Phone") || req.headers.get("x-user-phone");
  const phone = phoneFromBody || phoneFromHeader || "";

  if (!phone) {
    return new Response("Missing phone", { status: 400 });
  }

  const phoneRow = await db
    .select()
    .from(userPhones)
    .where(eq(userPhones.phoneNumber, phone))
    .limit(1)
    .then((rows) => rows.at(0));

  if (!phoneRow) {
    return new Response("Unknown phone", { status: 404 });
  }

  const projects = await db
    .select({
      id: appsTable.id,
      name: appsTable.name,
      description: appsTable.description,
      gitRepo: appsTable.gitRepo,
      createdAt: appsTable.createdAt,
      previewDomain: appsTable.previewDomain,
    })
    .from(appUsers)
    .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
    .where(eq(appUsers.userId, phoneRow.userId))
    .orderBy(desc(appsTable.createdAt));

  return Response.json({ projects });
}


