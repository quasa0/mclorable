import { HomeIcon, TerminalIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { ShareButton } from "./share-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ProductCreationModal } from "./product-creation-modal";

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
          variant={"ghost"}
          size={"icon"}
          onClick={onRefresh}
          disabled={!onRefresh}
        >
          <RefreshCwIcon />
        </Button>
        <ShareButton domain={domain} appId={appId} />
        <a href={codeServerUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost" className="flex items-center gap-2">
            <img src="/logos/vscode.svg" className="h-4 w-4" alt="VS Code Logo" />
            <span>VS Code</span>
          </Button>
        </a>
        <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost" className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4" />
            <span>Terminal</span>
          </Button>
        </a>
        {appId && <ProductCreationModal appId={appId} />}
        
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={"ghost"}>
            <img
              src="/logos/vscode.svg"
              className="h-4 w-4"
              alt="VS Code Logo"
            />
            {/* <img
              src="/logos/cursor.png"
              className="h-4 w-4"
              alt="Cursor Logo"
            /> */}
            <TerminalIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open In</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex flex-col gap-2 pb-4">
              <div className="font-bold mt-4 flex items-center gap-2">
                <GlobeIcon className="inline h-4 w-4 ml-1" />
                Browser
              </div>
              <div>
                <a href={codeServerUrl} target="_blank" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src="/logos/vscode.svg"
                        className="h-4 w-4"
                        alt="VS Code Logo"
                      />
                      <span>VS Code</span>
                    </div>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div>
                <a href={consoleUrl} target="_blank" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <TerminalIcon className="h-4 w-4" />
                      <span>Console</span>
                    </div>
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* <div className="font-bold mt-4 flex items-center gap-2">
                <ComputerIcon className="inline h-4 w-4 ml-1" />
                Local
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText();
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/logos/vscode.svg"
                      className="h-4 w-4"
                      alt="VS Code Logo"
                    />
                    <span>VS Code Remote</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div>

              <div>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(`ssh ${}@vm-ssh`);
                    setModalOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="h-4 w-4" />
                    <span>SSH</span>
                  </div>
                  <span>Copy Command</span>
                </Button>
              </div> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
