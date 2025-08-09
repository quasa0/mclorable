"use client";

import { ArrowRight, Code, Zap, Github, Coffee } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { AnimatedPromptInput } from "./animated-prompt-input";

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    router.push(
      `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
    );
  };

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        await handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [prompt]);

  // Light theme colors
  const lightBg = "#ffffff";
  const lightBorder = "#e4e4e7";
  const lightText = "#0a0a0b";
  const lightTextSecondary = "#71717a";
  const lightTextMuted = "#71717a";
  const lightGradient1 =
    "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.8))";
  const lightGradient2 =
    "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.6))";
  const lightGradient3 =
    "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.4))";
  const lightGridBg =
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='39' height='39' rx='3.5' fill='white'/%3E%3Cpath d='M0 39.5H40V40H0V39.5ZM39.5 0V40H40V0H39.5ZM0 0.5H40V0H0V0.5ZM0.5 0V40H0V0H0.5Z' fill='%23e4e4e7'/%3E%3C/svg%3E\")";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: lightBg,
        color: lightText,
      }}
    >
      <div className="w-full max-w-7xl mx-auto h-full flex flex-col relative">
        <div
          className="flex-1 p-4 rounded-lg border relative overflow-hidden flex flex-col min-h-[calc(100vh-2rem)] mx-2 my-2"
          style={{
            background: lightBg,
            borderColor: lightBorder,
          }}
        >
          <div
            className="absolute inset-x-0 -top-[190%] bottom-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: lightGridBg,
              opacity: 0.5,
            }}
          />

          {/* Centered Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="absolute top-[2rem] left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="h-8 flex items-center justify-center">
              <span className="text-3xl">🌈</span>
            </div>
          </motion.div>

          {/* Navigation Bar */}
          <div className="w-full hidden md:flex items-center justify-between px-4 pt-10 relative z-10">
            {/* Left Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-sm transition-colors hover:bg-transparent"
                style={{ color: lightTextSecondary }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(116, 116, 122, 0.1)";
                  (e.currentTarget as HTMLElement).style.color = lightText;
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    lightTextSecondary;
                }}
                asChild
              >
                <Link href="/">Code Generator</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm transition-colors hover:bg-transparent"
                style={{ color: lightTextSecondary }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(116, 116, 122, 0.1)";
                  (e.currentTarget as HTMLElement).style.color = lightText;
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    lightTextSecondary;
                }}
                asChild
              >
                <Link href="/docs">Documentation</Link>
              </Button>
            </motion.div>

            {/* Right Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-sm transition-colors hover:bg-transparent"
                style={{ color: lightTextSecondary }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(116, 116, 122, 0.1)";
                  (e.currentTarget as HTMLElement).style.color = lightText;
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color =
                    lightTextSecondary;
                }}
                asChild
              >
                <Link
                  href="https://github.com/serafimcloud/mclorable"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Main Content - Centered */}
          <div className="flex-1 flex items-center justify-center px-4 relative z-10">
            <div className="flex flex-col w-full max-w-4xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-6 md:mb-8 leading-[1.2] pb-1"
              >
                <span className="text-transparent animate-rainbow-text font-bold">
                  McLovin
                </span>{" "}
                <br className="hidden lg:inline" />
                <span
                  className="bg-clip-text text-transparent backdrop-blur-xl"
                  style={{
                    backgroundImage: lightGradient1,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Your AI-powered CTO
                </span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-base sm:text-lg md:text-xl tracking-tight bg-clip-text text-transparent backdrop-blur-xl leading-[1.2] mb-8 md:mb-12 max-w-[600px] mx-auto"
                style={{
                  backgroundImage: lightGradient2,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Only pay for generated revenue, not meaningless tokens.{" "}
                <br className="hidden lg:inline" />
                McLovin charges just 3% of what you earn
              </motion.h2>

              {/* Prompt Input */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="w-full max-w-2xl mx-auto mb-8"
              >
                <AnimatedPromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  framework={framework}
                  onFrameworkChange={setFramework}
                  placeholder="Describe the app you want to build..."
                />
              </motion.div>

              {/* Feature Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-center"
              >
                <p
                  className="text-base sm:text-lg md:text-xl tracking-tight bg-clip-text text-transparent backdrop-blur-xl leading-[1.2] max-w-[600px] mx-auto mb-4"
                  style={{
                    backgroundImage: lightGradient3,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Performance-based pricing • No upfront costs
                </p>
                <div className="flex flex-col gap-4">
                  {/* Feature Icons Row */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-12 max-w-[600px] mx-auto"
                    style={{ color: lightText }}
                  >
                    <div className="flex flex-col items-center gap-3 group cursor-default">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white/50 backdrop-blur-sm group-hover:border-gray-300 group-hover:bg-white/80 transition-all duration-200">
                        <Code className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                        Code Generation
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group cursor-default">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white/50 backdrop-blur-sm group-hover:border-gray-300 group-hover:bg-white/80 transition-all duration-200">
                        <Zap className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                        Instant Deploy
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-3 group cursor-default">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white/50 backdrop-blur-sm group-hover:border-gray-300 group-hover:bg-white/80 transition-all duration-200">
                        <Coffee className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                        Zero Config
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
