"use client";

import React from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  MessageCircle,
} from "lucide-react";
import type { RiskSeverity } from "@/types/portfolio";

const severityConfig: Record<
  RiskSeverity,
  { icon: React.ElementType; color: string; badge: string; bgColor: string }
> = {
  critical: {
    icon: ShieldAlert,
    color: "text-destructive",
    badge: "destructive",
    bgColor: "bg-destructive/5 border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-primary",
    badge: "warning",
    bgColor: "bg-primary/5 border-primary/20",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    badge: "info",
    bgColor: "bg-blue-500/5 border-blue-500/20",
  },
};

export function RisksView() {
  const risks = usePortfolioStore((s) => s.risks);
  const riskThresholds = usePortfolioStore((s) => s.riskThresholds);
  const setActiveView = usePortfolioStore((s) => s.setActiveView);

  const criticalCount = risks.filter((r) => r.severity === "critical").length;
  const warningCount = risks.filter((r) => r.severity === "warning").length;
  const infoCount = risks.filter((r) => r.severity === "info").length;

  const healthScore =
    risks.length === 0
      ? 100
      : Math.max(0, 100 - criticalCount * 30 - warningCount * 15 - infoCount * 5);

  const healthLabel =
    healthScore >= 80 ? "Healthy" : healthScore >= 50 ? "Needs Attention" : "At Risk";
  const healthColor =
    healthScore >= 80 ? "text-gain" : healthScore >= 50 ? "text-primary" : "text-destructive";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Assessment</h2>
          <p className="text-sm text-muted-foreground">
            Threshold-based risk analysis with {risks.length} checks
          </p>
        </div>
        <Button onClick={() => setActiveView("chat")} variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Ask AI to Explain
        </Button>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-secondary">
              <div className="text-center">
                <p className={`text-2xl font-bold ${healthColor}`}>{healthScore}</p>
                <p className="text-[10px] text-muted-foreground">SCORE</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {healthScore >= 80 ? (
                  <ShieldCheck className="w-5 h-5 text-gain" />
                ) : (
                  <ShieldAlert className={`w-5 h-5 ${healthColor}`} />
                )}
                <p className={`text-lg font-bold ${healthColor}`}>{healthLabel}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {criticalCount > 0
                  ? `${criticalCount} critical issue${criticalCount > 1 ? "s" : ""} need immediate attention.`
                  : warningCount > 0
                  ? `${warningCount} warning${warningCount > 1 ? "s" : ""} detected. Review recommended.`
                  : "No significant risks detected. Keep monitoring!"}
              </p>
              <div className="flex gap-2 mt-3">
                {criticalCount > 0 && <Badge variant="destructive">{criticalCount} Critical</Badge>}
                {warningCount > 0 && <Badge variant="warning">{warningCount} Warning</Badge>}
                {infoCount > 0 && <Badge variant="info">{infoCount} Info</Badge>}
                {risks.length === 0 && <Badge variant="success">All Clear</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Cards */}
      <div className="space-y-3">
        {risks.map((risk) => {
          const config = severityConfig[risk.severity];
          const Icon = config.icon;
          const progress = Math.min((risk.currentValue / risk.threshold) * 100, 150);

          return (
            <Card key={risk.id} className={`border ${config.bgColor}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{risk.title}</p>
                        <Badge variant={config.badge as any} className="text-[10px]">
                          {risk.severity}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {risk.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Current: <span className="font-medium text-foreground">{risk.currentValue.toFixed(1)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Threshold: <span className="font-medium text-foreground">{risk.threshold}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            risk.severity === "critical"
                              ? "bg-destructive"
                              : risk.severity === "warning"
                              ? "bg-primary"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {risks.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <ShieldCheck className="w-12 h-12 text-gain" />
              <p className="text-lg font-medium">All Clear!</p>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                No risk thresholds exceeded. Your portfolio is within configured limits.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Thresholds Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Current Thresholds</CardTitle>
          <CardDescription>Adjust these in Settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Max Crypto", value: `${riskThresholds.maxCryptoPercent}%` },
              { label: "Max Single Stock", value: `${riskThresholds.maxSingleStockPercent}%` },
              { label: "Max Sector", value: `${riskThresholds.maxSingleSectorPercent}%` },
              { label: "Max Region", value: `${riskThresholds.maxSingleRegionPercent}%` },
              { label: "Min Holdings", value: `${riskThresholds.minHoldingsCount}` },
              { label: "Max ETF Overlap", value: `${riskThresholds.maxEtfOverlapPercent}%` },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
