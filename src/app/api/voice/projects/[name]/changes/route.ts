import { NextRequest, after } from "next/server";
import { db, appsTable, appUsers, userPhones } from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";

function getPhone(req: NextRequest): string | null {
  const url = new URL(req.url);
  const qp = url.searchParams.get("phone");
  const hdr = req.headers.get("X-User-Phone") || req.headers.get("x-user-phone");
  return (qp || hdr || "").trim() || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const phone = getPhone(req);
  const { instructions } = await req.json();
  const name = (await params).name;

  if (!phone || !name || !instructions) {
    return new Response("Missing phone, name, or instructions", { status: 400 });
  }

  const phoneRow = await db
    .select()
    .from(userPhones)
    .where(eq(userPhones.phoneNumber, phone))
    .limit(1)
    .then((rows) => rows.at(0));

  if (!phoneRow) {
    // Auto-provision so we can proceed
    const identity = await (await import("@/lib/freestyle")).freestyle.createGitIdentity();
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

  // Find an app owned by this user by a short name/handle match (case-insensitive)
  const app = await db
    .select({ id: appsTable.id })
    .from(appsTable)
    .innerJoin(appUsers, eq(appUsers.appId, appsTable.id))
    .where(and(eq(appUsers.userId, phoneRow.userId), ilike(appsTable.name, name)))
    .limit(1)
    .then((rows) => rows.at(0));

  if (!app) {
    return new Response("Project not found", { status: 404 });
  }

  const messages = [
    {
      id: crypto.randomUUID(),
      parts: [{ type: "text", text: String(instructions) }],
      role: "user",
    },
  ];

  // Fire-and-forget kickoff; return 202 immediately
  after(async () => {
    try {
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
      console.error("Failed to start background change stream:", err);
    }
  });

  return Response.json({ success: true, appId: app.id, streamUrl: `/api/chat/${app.id}/stream` }, { status: 202 });
}


