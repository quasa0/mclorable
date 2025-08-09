"use client";

import { Button } from "@/components/ui/button";
import {
  Share2Icon,
  LinkIcon,
  CopyIcon,
  ExternalLinkIcon,
  RocketIcon,
  Loader2Icon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { publishApp } from "@/actions/publish-app";
import { useState } from "react";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

interface ShareButtonProps {
  className?: string;
  domain?: string;
  appId: string;
  variant?: ButtonVariant;
}

export function ShareButton({ className, domain, appId, variant = "ghost" }: ShareButtonProps) {
  // The domain may be undefined if no previewDomain exists in the database
  const [isPublishing, setIsPublishing] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishApp({
        appId: appId,
      });
      toast.success("Latest version published successfully!");
    } catch (error) {
      toast.error("Failed to publish app");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={`flex items-center gap-1 ${className || ""}`}
        >
          Share
          <Share2Icon className="h-4 w-4 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Share App</DialogTitle>
          <DialogDescription>
            {domain
              ? "Share your app using the preview domain or publish the latest version."
              : "Publish your app to create a shareable preview URL."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 mt-4">
          {domain ? (
            <>
              <div>
                <Label htmlFor="share-url" className="mb-2 block">
                  Preview Domain
                </Label>
                <div className="grid grid-cols-[1fr_auto] w-full overflow-hidden border border-input rounded-md">
                  <div className="overflow-hidden flex items-center bg-muted px-3 py-2">
                    <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <div className="truncate">
                      <span className="text-sm">https://{domain}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 px-3 border-l border-input rounded-l-none"
                    onClick={() => copyToClipboard(`https://${domain}`)}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(`https://${domain}`, "_blank")}
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Visit Preview
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <RocketIcon className="h-4 w-4" />
                  )}
                  Publish Latest
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                No preview domain available yet. Publish your app to create a
                preview URL.
              </p>
              <Button
                variant="default"
                size="default"
                className="gap-2 w-full"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <RocketIcon className="h-4 w-4" />
                )}
                Publish
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
