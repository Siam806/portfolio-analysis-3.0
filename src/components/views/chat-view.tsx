"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage, runWorkflow } from "@/ai/providers";
import { WORKFLOW_PROMPTS } from "@/ai/prompts";
import { v4 as uuid } from "uuid";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Heart,
  Activity,
  Search,
  Scale,
  FileText,
  BookOpen,
  AlertCircle,
  Loader2,
  Trash2,
  Info,
} from "lucide-react";
import type { ChatMessage } from "@/types/portfolio";

const STARTER_QUESTIONS = [
  "How are you doing today?",
  "What are your hidden risks?",
  "Explain yourself like I'm a beginner",
  "What's worrying you right now?",
  "How diversified am I really?",
  "What would you change about yourself?",
];

const WORKFLOW_CARDS = [
  {
    id: "healthReview",
    label: "Health Review",
    icon: Heart,
    description: "Comprehensive portfolio health check",
  },
  {
    id: "concentrationDetective",
    label: "Concentration Check",
    icon: Search,
    description: "Find hidden concentration risks",
  },
  {
    id: "rebalancingPlanner",
    label: "Rebalancing Plan",
    icon: Scale,
    description: "Plan how to rebalance",
  },
  {
    id: "etfLookThrough",
    label: "ETF Look-Through",
    icon: Activity,
    description: "What you really own via ETFs",
  },
  {
    id: "monthlyReview",
    label: "Monthly Review",
    icon: FileText,
    description: "Generate monthly report",
  },
  {
    id: "beginnerExplanation",
    label: "Explain Simply",
    icon: BookOpen,
    description: "Beginner-friendly explanation",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
        <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
        <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
      </div>
      <span className="text-xs text-muted-foreground ml-2">Portfolio is thinking...</span>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-secondary" : "bg-primary/10"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border"
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Tool call citations */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
            {message.toolCalls.map((tc, i) => (
              <Badge key={i} variant="outline" className="text-[10px] gap-1">
                <Info className="w-3 h-3" />
                {tc.toolName}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50 mt-1">
          {new Date(message.timestamp).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function ChatView() {
  const chatMessages = usePortfolioStore((s) => s.chatMessages);
  const addChatMessage = usePortfolioStore((s) => s.addChatMessage);
  const clearChat = usePortfolioStore((s) => s.clearChat);
  const aiConfig = usePortfolioStore((s) => s.aiConfig);
  const personalityConfig = usePortfolioStore((s) => s.personalityConfig);
  const holdings = usePortfolioStore((s) => s.holdings);
  const risks = usePortfolioStore((s) => s.risks);
  const setActiveView = usePortfolioStore((s) => s.setActiveView);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading, scrollToBottom]);

  // Determine portfolio mood
  const criticalRisks = risks.filter((r) => r.severity === "critical").length;
  const warningRisks = risks.filter((r) => r.severity === "warning").length;
  const mood =
    criticalRisks > 0
      ? { label: "Concerned", color: "text-destructive", emoji: "😟" }
      : warningRisks > 0
      ? { label: "Attentive", color: "text-primary", emoji: "🤔" }
      : holdings.length === 0
      ? { label: "Curious", color: "text-blue-400", emoji: "👋" }
      : { label: "Confident", color: "text-gain", emoji: "😊" };

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isLoading) return;

    setError(null);
    setInput("");

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    if (!aiConfig.enabled || !aiConfig.apiKey) {
      setError("AI features are not enabled. Please add your API key in Settings.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendMessage(message, chatMessages, aiConfig, personalityConfig);
      const assistantMsg: ChatMessage = {
        id: uuid(),
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        toolCalls: response.toolCalls?.map((tc) => ({
          toolName: tc.name,
          input: tc.params,
          output: tc.result,
        })),
      };
      addChatMessage(assistantMsg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get response from AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflow = async (workflowId: string) => {
    const prompt = WORKFLOW_PROMPTS[workflowId as keyof typeof WORKFLOW_PROMPTS];
    if (!prompt) return;

    const card = WORKFLOW_CARDS.find((w) => w.id === workflowId);
    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: `Run workflow: ${card?.label || workflowId}`,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    if (!aiConfig.enabled || !aiConfig.apiKey) {
      setError("AI features are not enabled. Please add your API key in Settings.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await runWorkflow(prompt, aiConfig, personalityConfig);
      const assistantMsg: ChatMessage = {
        id: uuid(),
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        toolCalls: response.toolCalls?.map((tc) => ({
          toolName: tc.name,
          input: tc.params,
          output: tc.result,
        })),
      };
      addChatMessage(assistantMsg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Workflow failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = chatMessages.length === 0;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 text-sm">{mood.emoji}</span>
          </div>
          <div>
            <h2 className="text-sm font-bold">Your Portfolio</h2>
            <p className={`text-xs ${mood.color}`}>
              Feeling {mood.label.toLowerCase()} &middot;{" "}
              {holdings.length} holdings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!aiConfig.enabled && (
            <Button variant="outline" size="sm" onClick={() => setActiveView("settings")} className="gap-1 text-xs">
              <AlertCircle className="w-3 h-3" />
              Setup AI
            </Button>
          )}
          {chatMessages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto">
            {/* Welcome */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                Talk to Your <span className="text-primary">Portfolio</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                I&apos;m your portfolio, personified. Ask me anything about my holdings,
                risks, or how I&apos;m feeling today. I use real data — never making things up.
              </p>
            </div>

            {/* Starter questions */}
            <div className="space-y-3 w-full">
              <p className="text-xs text-muted-foreground text-center">Try asking...</p>
              <div className="grid grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="p-3 rounded-lg border bg-card hover:bg-secondary/50 text-left text-sm transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Workflow cards */}
            <div className="space-y-3 w-full">
              <p className="text-xs text-muted-foreground text-center">Or run an analysis workflow...</p>
              <div className="grid grid-cols-3 gap-2">
                {WORKFLOW_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleWorkflow(card.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-secondary/50 text-center transition-colors"
                    >
                      <Icon className="w-5 h-5 text-primary" />
                      <p className="text-xs font-medium">{card.label}</p>
                      <p className="text-[10px] text-muted-foreground">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {chatMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-card/50 px-6 py-4">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Talk to your portfolio..."
              rows={1}
              className="w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] max-h-32"
              style={{ height: "44px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
          </div>
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl h-11 w-11"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Educational analysis only — not financial advice. All data verified through deterministic calculations.
        </p>
      </div>
    </div>
  );
}
