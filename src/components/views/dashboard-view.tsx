"use client";

import React from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  ShieldAlert,
  MessageCircle,
  ArrowRight,
  Wallet,
  Landmark,
  Receipt,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "hsl(47, 96%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(217, 91%, 60%)",
  "hsl(280, 67%, 60%)",
  "hsl(0, 63%, 51%)",
  "hsl(25, 95%, 53%)",
  "hsl(180, 60%, 45%)",
  "hsl(330, 65%, 55%)",
  "hsl(60, 80%, 50%)",
  "hsl(200, 70%, 50%)",
];

export function DashboardView() {
  const summary = usePortfolioStore((s) => s.summary);
  const holdings = usePortfolioStore((s) => s.holdings);
  const exposure = usePortfolioStore((s) => s.exposure);
  const risks = usePortfolioStore((s) => s.risks);
  const setActiveView = usePortfolioStore((s) => s.setActiveView);

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No portfolio data. Please import a CSV first.</p>
      </div>
    );
  }

  const criticalRisks = risks.filter((r) => r.severity === "critical").length;
  const warningRisks = risks.filter((r) => r.severity === "warning").length;

  const holdingsPieData = holdings.slice(0, 8).map((h) => ({
    name: h.name.length > 20 ? h.name.substring(0, 20) + "..." : h.name,
    value: h.currentValue,
    weight: h.weight,
  }));
  const othersValue = holdings.slice(8).reduce((s, h) => s + h.currentValue, 0);
  if (othersValue > 0) {
    holdingsPieData.push({ name: "Others", value: othersValue, weight: (othersValue / summary.totalValue) * 100 });
  }

  const sectorData = (exposure?.sector || []).slice(0, 8).map((s) => ({
    name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
    percent: Math.round(s.percent * 10) / 10,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(summary.lastUpdated).toLocaleDateString("de-DE")}
          </p>
        </div>
        <Button onClick={() => setActiveView("chat")} className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Talk to Portfolio
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${summary.totalGain >= 0 ? "bg-gain/10" : "bg-loss/10"}`}>
                {summary.totalGain >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-gain" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-loss" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-xl font-bold ${summary.totalGain >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatCurrency(summary.totalGain)}
                </p>
                <p className={`text-xs ${summary.totalGain >= 0 ? "text-gain" : "text-loss"}`}>
                  {formatPercent(summary.totalGainPercent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dividends</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalDividends)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Receipt className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fees & Taxes</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.totalFees + summary.totalTaxes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Holdings Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Holdings Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={holdingsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {holdingsPieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {holdingsPieData.slice(0, 6).map((h, i) => (
                <div key={h.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{h.name}</span>
                  <span className="ml-auto font-medium">{h.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Sector Exposure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="percent" fill="hsl(47, 96%, 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              Risk Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveView("risks")} className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No risk flags detected. Your portfolio looks healthy!
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                {criticalRisks > 0 && (
                  <Badge variant="destructive">{criticalRisks} Critical</Badge>
                )}
                {warningRisks > 0 && (
                  <Badge variant="warning">{warningRisks} Warning</Badge>
                )}
                <Badge variant="info">{risks.length} Total</Badge>
              </div>
              <div className="space-y-2">
                {risks.slice(0, 3).map((risk) => (
                  <div
                    key={risk.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          risk.severity === "critical"
                            ? "bg-destructive"
                            : risk.severity === "warning"
                            ? "bg-primary"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{risk.title}</p>
                        <p className="text-xs text-muted-foreground">{risk.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono">
                      {risk.currentValue.toFixed(1)}
                      <span className="text-muted-foreground">/{risk.threshold}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
