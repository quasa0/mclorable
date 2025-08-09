import { HomeIcon, TerminalIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { GlassEffect } from "./ui/liquidy-glass";
import { ShareButton } from "./share-button";

export function TopBar({
  appName,
  children,
  repoId,
  consoleUrl,
  codeServerUrl,
  domain,
  appId,
  onRefresh,
}: {
  appName: string;
  children?: React.ReactNode;
  repoId: string;
  consoleUrl: string;
  codeServerUrl: string;
  domain?: string;
  appId: string;
  onRefresh?: () => void;
}) {
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 py-2" />;
}
