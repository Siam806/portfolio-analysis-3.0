"use client";

import React from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";
import {
  Upload,
  LayoutDashboard,
  MessageCircle,
  PieChart,
  Globe,
  ShieldAlert,
  FlaskConical,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "upload", label: "Import", icon: Upload },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, requiresData: true },
  { id: "chat", label: "AI Analyst", icon: MessageCircle, requiresData: true, highlight: true },
  { id: "holdings", label: "Holdings", icon: PieChart, requiresData: true },
  { id: "exposure", label: "Exposure", icon: Globe, requiresData: true },
  { id: "risks", label: "Risks", icon: ShieldAlert, requiresData: true },
  { id: "scenarios", label: "Scenarios", icon: FlaskConical, requiresData: true },
  { id: "reports", label: "Reports", icon: FileText, requiresData: true },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const activeView = usePortfolioStore((s) => s.activeView);
  const setActiveView = usePortfolioStore((s) => s.setActiveView);
  const hasData = usePortfolioStore((s) => s.transactions.length > 0);
  const summary = usePortfolioStore((s) => s.summary);

  return (
    <aside className="flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">Portfolio 3.0</h1>
          <p className="text-xs text-muted-foreground">Talk to Your Portfolio</p>
        </div>
      </div>

      {/* Portfolio status mini card */}
      {summary && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="text-lg font-bold text-foreground">
            {new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
            }).format(summary.totalValue)}
          </p>
          <p className="text-xs text-muted-foreground">
            {summary.holdingsCount} holdings
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const disabled = item.requiresData && !hasData;
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => !disabled && setActiveView(item.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                disabled && "opacity-30 cursor-not-allowed",
                item.highlight && !disabled && !isActive && "text-primary/70"
              )}
            >
              <Icon className={cn("w-4 h-4", item.highlight && !disabled && "text-primary")} />
              {item.label}
              {item.highlight && !disabled && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-primary mood-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Self-hosted &middot; Privacy-first
        </p>
      </div>
    </aside>
  );
}
