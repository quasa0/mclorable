import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { db, appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendSMSSkipCalls } from "@/lib/sendSMS";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { UIMessage } from "ai";
import { builderAgent } from "@/mastra/agents/builder";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
import {
  isStreamRunning,
  stopStream,
  waitForStreamToStop,
  clearStreamState,
  sendMessageWithStreaming,
} from "@/lib/internal/stream-manager";
EventEmitter.defaultMaxListeners = 1000;

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("creating new chat stream");
  const appId = getAppIdFromHeaders(req);
  const phone = req.headers.get("X-User-Phone");

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const app = await getApp(appId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  // Check if a stream is already running and stop it if necessary
  if (await isStreamRunning(appId)) {
    console.log("Stopping previous stream for appId:", appId);
    await stopStream(appId);

    // Wait until stream state is cleared
    const stopped = await waitForStreamToStop(appId);
    if (!stopped) {
      await clearStreamState(appId);
      return new Response(
        "Previous stream is still shutting down, please try again",
        { status: 429 }
      );
    }
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const { mcpEphemeralUrl, fs, ephemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
  });

  const resumableStream = await sendMessageWithStreaming(
    builderAgent,
    appId,
    mcpEphemeralUrl,
    fs,
    messages.at(-1)!,
    {
      onFinish: async () => {
        try {
          if (!phone) return;

          // Prefer sharing the dev server (ephemeral) URL if available
          let shareUrl = ephemeralUrl ?? null;

          if (!shareUrl) {
            // Fallback to preview domain (stable) if dev server URL isn't available
            let previewDomain = app.info.previewDomain;
            if (!previewDomain) {
              if (!process.env.PREVIEW_DOMAIN) {
                console.warn("PREVIEW_DOMAIN not set; no URL to share");
                return;
              }
              const domainPrefix = uniqueNamesGenerator({
                dictionaries: [adjectives, animals],
                separator: "",
                length: 2,
              });
              const domain = `${domainPrefix}.${process.env.PREVIEW_DOMAIN}`;
              await db
                .update(appsTable)
                .set({ previewDomain: domain })
                .where(eq(appsTable.id, appId))
                .execute();
              previewDomain = domain;

              // Deploy latest to preview domain
              await freestyle.deployWeb(
                {
                  kind: "git",
                  url: `https://git.freestyle.sh/${app.info.gitRepo}`,
                },
                {
                  build: true,
                  domains: [previewDomain!],
                }
              );
            }

            shareUrl = previewDomain!.startsWith("http")
              ? previewDomain!
              : `https://${previewDomain}`;
          }

          await sendSMSSkipCalls(
            phone,
            `Your app is ready! Preview: ${shareUrl}`
          );
        } catch (err) {
          console.error("Failed to send SMS or prepare preview:", err);
        }
      },
    }
  );

  return resumableStream.response();
}
