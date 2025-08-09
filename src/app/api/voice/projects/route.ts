import { NextRequest } from "next/server";
import { after } from "next/server";
import { db, appsTable, appUsers, userPhones } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";

function getPhoneFromRequest(req: NextRequest): string | null {
  const url = new URL(req.url);
  const qp = url.searchParams.get("phone");
  const hdr = req.headers.get("X-User-Phone") || req.headers.get("x-user-phone");
  return (qp || hdr || "").trim() || null;
}

export async function GET(req: NextRequest) {
  const phone = getPhoneFromRequest(req);
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

export async function POST(req: NextRequest) {
  const { phone, name, instructions, templateId } = await req.json();

  if (!phone || !name) {
    return new Response("Missing phone or name", { status: 400 });
  }

  let phoneRow = await db
    .select()
    .from(userPhones)
    .where(eq(userPhones.phoneNumber, phone))
    .limit(1)
    .then((rows) => rows.at(0));

  if (!phoneRow) {
    // Auto-provision a new voice user for this phone
    const identity = await freestyle.createGitIdentity();
    const newUserId = `phone:${phone}`;
    await db
      .insert(userPhones)
      .values({
        phoneNumber: phone,
        userId: newUserId,
        freestyleIdentity: identity.id,
      })
      .execute();
    phoneRow = {
      phoneNumber: phone,
      userId: newUserId,
      freestyleIdentity: identity.id,
      createdAt: new Date(),
    } as typeof phoneRow;
  }

  const chosenTemplate = templates[templateId as keyof typeof templates] ?? templates["nextjs"];
  if (!chosenTemplate) {
    return new Response("Invalid template", { status: 400 });
  }

  // Create repo and grant access
  const repo = await freestyle.createGitRepository({
    name: name,
    public: true,
    source: { type: "git", url: chosenTemplate.repo },
  });
  await freestyle.grantGitPermission({
    identityId: phoneRow.freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  const token = await freestyle.createGitAccessToken({
    identityId: phoneRow.freestyleIdentity,
  });

  // Create app + membership
  const app = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: name,
      })
      .returning();

    await tx
      .insert(appUsers)
      .values({
        appId: inserted.id,
        userId: phoneRow.userId,
        permissions: "admin",
        freestyleAccessToken: token.token,
        freestyleAccessTokenId: token.id,
        freestyleIdentity: phoneRow.freestyleIdentity,
      })
      .returning();

    return inserted;
  });

  // Ensure memory thread exists immediately for this app
  await memory.createThread({ threadId: app.id, resourceId: app.id });

  // If instructions provided, kick off a background build stream via existing /api/chat
  if (instructions && typeof instructions === "string" && instructions.trim().length > 0) {
    after(async () => {
      try {
        const messages = [
          {
            id: crypto.randomUUID(),
            parts: [{ type: "text", text: instructions as string }],
            role: "user",
          },
        ];
        await fetch(new URL("/api/chat", req.url), {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Adorable-App-Id": app.id,
            "X-User-Phone": phone,
          },
          body: JSON.stringify({ messages }),
        });
      } catch (err) {
        console.error("Failed to start background instruction stream:", err);
      }
    });
  }

  return Response.json(
    {
      app,
      streamUrl: `/api/chat/${app.id}/stream`,
      success: true,
    },
    { status: 202 }
  );
}


