"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Paperclip,
  Command,
  XIcon,
  LoaderIcon,
  SendIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as React from "react";
import { FrameworkSelector } from "./framework-selector";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-gray-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-blue-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface AnimatedPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  framework: string;
  onFrameworkChange: (framework: string) => void;
  placeholder?: string;
}

export function AnimatedPromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  framework,
  onFrameworkChange,
  placeholder = "Describe the app you want to build...",
}: AnimatedPromptInputProps) {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Light theme colors
  const lightBg = "rgba(255, 255, 255, 0.95)";
  const lightBorder = "rgba(228, 228, 231, 0.3)";
  const lightText = "#0a0a0b";
  const lightTextSecondary = "#71717a";

  return (
    <motion.div
      className="relative backdrop-blur-[40px] border border-gray-200/50 rounded-2xl shadow-xl"
      style={{
        background: "rgba(255, 255, 255, 0.98)",
        borderColor: lightBorder,
      }}
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      {/* Grid background overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H20V0.5H0V0ZM0 0V20H0.5V0H0Z' fill='%23e4e4e7'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="p-4 relative z-10">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={placeholder}
          containerClassName="w-full"
          className={cn(
            "w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none",
            "text-sm",
            "focus:outline-none",
            "min-h-[60px]"
          )}
          style={{
            overflow: "hidden",
            color: lightText,
          }}
          showRing={false}
        />
      </div>

      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            className="px-4 pb-3 flex gap-2 flex-wrap relative z-10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-xs bg-gray-100/50 py-1.5 px-3 rounded-lg text-gray-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span>{file}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="p-4 border-t flex items-center justify-between gap-4 relative z-10"
        style={{
          borderColor: lightBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={handleAttachFile}
            whileTap={{ scale: 0.94 }}
            className="p-2 rounded-lg transition-colors relative group"
            style={{ color: lightTextSecondary }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(116, 116, 122, 0.1)";
              (e.currentTarget as HTMLElement).style.color = lightText;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = lightTextSecondary;
            }}
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          <FrameworkSelector value={framework} onChange={onFrameworkChange} />
        </div>

        <motion.button
          type="button"
          onClick={onSubmit}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || !value.trim()}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            "flex items-center gap-2",
            value.trim()
              ? "bg-black text-white shadow-lg"
              : "bg-gray-200/50 text-gray-400"
          )}
        >
          {isLoading ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Start Creating</span>
          <span className="sm:hidden">Create</span>
        </motion.button>
      </div>

      {/* Focus glow effect */}
      {inputFocused && (
        <motion.div
          className="absolute -inset-2 rounded-2xl pointer-events-none opacity-30"
          style={{
            background:
              "linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))",
            filter: "blur(16px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}
