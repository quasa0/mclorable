"use client";

import React, { useEffect, useState, useCallback } from "react";
import Chat from "./chat";
import WebView from "./webview";
import { UIMessage } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlassEffect } from "./ui/liquidy-glass";
import { RefreshCwIcon, TerminalIcon } from "lucide-react";
import { ProductCreationModal } from "./product-creation-modal";

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
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(
    null
  );

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
              mask: "linear-gradient(rgba(255, 255, 255, 0.25), black, black)",
              WebkitMask:
                "linear-gradient(rgba(255, 255, 255, 0.25), black, black)",
              maskSize: "auto",
              maskComposite: "add",
              maskMode: "match-source",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
        </div>

        {/* Bottom-centered chat overlay */}
        <QueryClientProvider client={queryClient}>
          <div className="pointer-events-none fixed inset-x-0 bottom-[max(16px,env(safe-area-inset-bottom))] z-20 flex justify-center px-4">
            <div className="pointer-events-auto w-full max-w-3xl sm:h-[40vh] h-[50vh]">
              <Chat
                appId={appId}
                initialMessages={initialMessages}
                key={appId}
                running={running}
              />
            </div>
          </div>
        </QueryClientProvider>

        {/* Bottom-left home button */}
        <div className="pointer-events-none fixed left-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-30"></div>

        {/* Bottom-right action overlay */}
        <div className="pointer-events-none fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-30 flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <GlassEffect
              className="h-10 w-10 rounded-xl flex items-center justify-center text-black/50 active:translate-y-px active:scale-95 hover:scale-95"
              onClick={refreshFunction || undefined}
              style={{
                opacity: refreshFunction ? 1 : 0.5,
                pointerEvents: refreshFunction ? "auto" : "none",
              }}
              overlayOpacity={0.18}
              outlineOpacity={0.25}
              outlineWidth={0.5}
              aria-label="Refresh"
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <RefreshCwIcon className="h-4 w-4 block" />
              </div>
            </GlassEffect>
            <GlassEffect
              className="h-10 w-10 rounded-xl flex items-center justify-center text-black/50 active:translate-y-px active:scale-95 hover:scale-95"
              href={codeServerUrl}
              target="_blank"
              overlayOpacity={0.18}
              outlineOpacity={0.25}
              outlineWidth={0.5}
              aria-label="Open in VS Code"
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <img
                  src="/logos/vscode.svg"
                  className="h-4 w-4 block"
                  alt="VS Code Logo"
                />
              </div>
            </GlassEffect>
            <GlassEffect
              target="_blank"
              href={consoleUrl}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-black/50 active:translate-y-px active:scale-95 hover:scale-95"
              overlayOpacity={0.18}
              outlineOpacity={0.25}
              outlineWidth={0.5}
              aria-label="Open Terminal"
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <TerminalIcon className="h-4 w-4" />
              </div>
            </GlassEffect>

            <ProductCreationModal appId={appId} />
          </div>
        </div>
      </div>
    </div>
  );
}
