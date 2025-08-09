import { HomeIcon, TerminalIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
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
  return (
    <div className="h-12 sticky top-0 flex items-center px-4 border-b border-gray-200 bg-background justify-between">
      <Link href={"/"}>
        <HomeIcon className="h-5 w-5" />
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={onRefresh}
          disabled={!onRefresh}
          className="shadow-sm"
        >
          <RefreshCwIcon className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
        <ShareButton domain={domain} appId={appId} variant="outline" className="shadow-sm" />
        <a href={codeServerUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="flex items-center gap-2 shadow-sm">
            <img src="/logos/vscode.svg" className="h-4 w-4" alt="VS Code Logo" />
            <span>VS Code</span>
          </Button>
        </a>
        <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="outline" className="flex items-center gap-2 shadow-sm">
            <TerminalIcon className="h-4 w-4" />
            <span>Terminal</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
