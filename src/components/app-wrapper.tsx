"use client";

import React, { useEffect } from "react";
import Chat from "./chat";
import { TopBar } from "./topbar";
import WebView from "./webview";
import { UIMessage } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppWrapper({
  appName,
  repo,
  initialMessages,
  appId,
  repoId,
  baseId,
  domain,
  running,
  codeServerUrl,
  consoleUrl,
}: {
  appName: string;
  repo: string;
  appId: string;
  respond?: boolean;
  initialMessages: UIMessage[];
  repoId: string;
  baseId: string;
  codeServerUrl: string;
  consoleUrl: string;
  domain?: string;
  running: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // or 'visible'
    };
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ height: "100dvh" }}>
      <TopBar
        appName={appName}
        repoId={repoId}
        consoleUrl={consoleUrl}
        codeServerUrl={codeServerUrl}
      />

      <div className="relative flex-1 overflow-hidden">
        {/* Preview fills the background */}
        <div className="absolute inset-0">
          <WebView repo={repo} baseId={baseId} appId={appId} domain={domain} />
        </div>

        {/* Bottom-centered chat overlay */}
        <QueryClientProvider client={queryClient}>
          <div className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
            <div className="pointer-events-auto w-full max-w-3xl sm:h-[40vh] h-[50vh]">
              <Chat appId={appId} initialMessages={initialMessages} key={appId} running={running} />
            </div>
          </div>
        </QueryClientProvider>
      </div>
    </div>
  );
}
