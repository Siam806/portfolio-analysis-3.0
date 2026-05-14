"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Globe, Building2, Factory, Layers } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ExposureEntry } from "@/types/portfolio";

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

type Tab = "geographic" | "sector" | "company" | "assetClass";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geographic", label: "Geographic", icon: Globe },
  { id: "sector", label: "Sector", icon: Factory },
  { id: "company", label: "Company", icon: Building2 },
  { id: "assetClass", label: "Asset Class", icon: Layers },
];

function ExposureTable({ entries }: { entries: ExposureEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{entry.name}</p>
              <Badge
                variant={
                  entry.source === "direct"
                    ? "info"
                    : entry.source === "etf-derived"
                    ? "warning"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {entry.source === "etf-derived" ? "ETF" : entry.source === "mixed" ? "Mixed" : "Direct"}
              </Badge>
            </div>
          </div>
          <div className="w-32">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(entry.percent, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right w-20">
            <p className="text-sm font-bold">{entry.percent.toFixed(1)}%</p>
          </div>
          <div className="text-right w-28 hidden md:block">
            <p className="text-xs text-muted-foreground">{formatCurrency(entry.value)}</p>
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No exposure data available for this dimension.
        </p>
      )}
    </div>
  );
}

export function ExposureView() {
  const exposure = usePortfolioStore((s) => s.exposure);
  const [activeTab, setActiveTab] = useState<Tab>("geographic");

  if (!exposure) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No exposure data. Please import a CSV first.</p>
      </div>
    );
  }

  const data = exposure[activeTab];
  const chartData = data.slice(0, 10).map((e) => ({
    name: e.name.length > 18 ? e.name.substring(0, 18) + "..." : e.name,
    percent: Math.round(e.percent * 10) / 10,
  }));

  const pieData = data.slice(0, 8).map((e) => ({
    name: e.name,
    value: e.percent,
  }));
  const othersPercent = data.slice(8).reduce((s, e) => s + e.percent, 0);
  if (othersPercent > 0) {
    pieData.push({ name: "Others", value: Math.round(othersPercent * 10) / 10 });
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Exposure Analysis</h2>
        <p className="text-sm text-muted-foreground">
          ETF look-through shows your true underlying exposure
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 8%)",
                      border: "1px solid hsl(217, 33%, 17%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Exposures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
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

      {/* Detail Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Exposures</CardTitle>
        </CardHeader>
        <CardContent>
          <ExposureTable entries={data} />
        </CardContent>
      </Card>
    </div>
  );
}
