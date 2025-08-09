"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

  const handleRefreshReady = useCallback((refreshFn: () => void) => {
    setRefreshFunction(() => refreshFn);
  }, []);

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
        domain={domain}
        appId={appId}
        onRefresh={refreshFunction || undefined}
      />

      <div className="relative flex-1 overflow-hidden">
        {/* Preview fills the background */}
        <div className="absolute inset-0">
          <WebView 
            repo={repo} 
            baseId={baseId} 
            appId={appId} 
            domain={domain} 
            onRefreshReady={handleRefreshReady}
          />
        </div>

        {/* Gradient underlay pinned to bottom across whole page (behind chat and preview) */}
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[250px] mix-blend-normal"
          aria-hidden
        >
          <div
            className="absolute inset-0 h-[250px] bg-gradient-to-t from-black/10 to-transparent"
            style={{
              mask: 'linear-gradient(rgba(255, 255, 255, 0.25), black, black)',
              WebkitMask: 'linear-gradient(rgba(255, 255, 255, 0.25), black, black)',
              maskSize: 'auto',
              maskComposite: 'add',
              maskMode: 'match-source',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          />
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
