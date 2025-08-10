"use server";

import { getApp } from "@/actions/get-app";
import AppWrapper from "../../../components/app-wrapper";
import { vercelSandbox } from "@/lib/vercel-sandbox";
import { db } from "@/db/schema";
import { appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/stack-auth";
import { memory } from "@/mastra/agents/builder";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/dist/client/link";
import { chatState } from "@/actions/chat-streaming";

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;

  const user = await getUser();

  const userPermission = (
    await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.userId, user.userId))
      .limit(1)
  ).at(0);

  if (!userPermission?.permissions) {
    return <ProjectNotFound />;
  }

  const app = await getApp(id).catch(() => undefined);

  if (!app) {
    return <ProjectNotFound />;
  }

  const { uiMessages } = await memory.query({
    threadId: id,
    resourceId: id,
  });

  // Use vercel sandbox with app id instead of git repo
  const { codeServerUrl, ephemeralUrl } = await vercelSandbox.requestDevServer(
    app.info.id
  );

  console.log("requested dev server");

  // Use the previewDomain from the database, or fall back to a generated domain
  const domain = app.info.previewDomain;

  return (
    <AppWrapper
      key={app.info.id}
      baseId={app.info.baseId}
      codeServerUrl={codeServerUrl}
      appName={app.info.name}
      initialMessages={uiMessages}
      consoleUrl={ephemeralUrl + "/__console"}
      repo={app.info.gitRepo}
      appId={app.info.id}
      repoId={app.info.gitRepo}
      domain={domain ?? undefined}
      running={(await chatState(app.info.id)).state === "running"}
    />
  );
}

function ProjectNotFound() {
  return (
    <div className="text-center my-16">
      Project not found or you don&apos;t have permission to access it.
      <div className="flex justify-center mt-4">
        <Link className={buttonVariants()} href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
}
