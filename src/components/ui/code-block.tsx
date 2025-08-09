"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border",
        "border-border bg-card text-card-foreground rounded-[5px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  className,
  ...props
}: CodeBlockCodeProps) {
  const { theme: browserTheme } = useTheme();

  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  const theme = browserTheme === "dark" ? "github-dark" : "github-light";

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });
      setHighlightedHtml(html);
    }
    highlight();
  }, [code, language, theme]);

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4 [&>pre]:!bg-transparent [&>pre>code]:!bg-transparent [&>pre]:!bg-opacity-0 [&>pre]:!shadow-none [&>pre]:!border-0",
    className,
  );

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <>
      <div
        className={cn(classNames, "glass-code")}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        {...props}
      />
      <style jsx>{`
        :global(.glass-code pre),
        :global(.glass-code code) {
          background: transparent !important;
        }
      `}</style>
    </>
  ) : (
    <>
      <div className={cn(classNames, "glass-code")} {...props}>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
      <style jsx>{`
        :global(.glass-code pre),
        :global(.glass-code code) {
          background: transparent !important;
        }
      `}</style>
    </>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
