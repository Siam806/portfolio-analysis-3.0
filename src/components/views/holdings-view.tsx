"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Search, ArrowUpDown, PieChart } from "lucide-react";

export function HoldingsView() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "weight" | "name">("value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = holdings
    .filter(
      (h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.isin.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "value":
          cmp = a.currentValue - b.currentValue;
          break;
        case "weight":
          cmp = a.weight - b.weight;
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

  const toggleSort = (col: "value" | "weight" | "name") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const assetClassColors: Record<string, string> = {
    stock: "info",
    etf: "success",
    crypto: "warning",
    bond: "secondary",
    unknown: "outline",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Holdings</h2>
          <p className="text-sm text-muted-foreground">
            {holdings.length} positions in your portfolio
          </p>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ISIN..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(["value", "weight", "name"] as const).map((col) => (
            <Button
              key={col}
              variant={sortBy === col ? "secondary" : "ghost"}
              size="sm"
              onClick={() => toggleSort(col)}
              className="gap-1 text-xs capitalize"
            >
              {col}
              <ArrowUpDown className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="space-y-2">
        {filtered.map((holding) => (
          <Card key={holding.isin} className="hover:bg-secondary/20 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {/* Name & Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{holding.name}</p>
                    <Badge variant={assetClassColors[holding.assetClass] as any || "outline"} className="text-[10px]">
                      {holding.assetClass.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {holding.isin} &middot; {holding.shares.toFixed(4)} shares
                  </p>
                </div>

                {/* Weight bar */}
                <div className="w-32 hidden md:block">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{holding.weight.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(holding.weight, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Value */}
                <div className="text-right w-32">
                  <p className="text-sm font-bold">{formatCurrency(holding.currentValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Cost: {formatCurrency(holding.totalCost)}
                  </p>
                </div>

                {/* Gain */}
                <div className="text-right w-24">
                  <p
                    className={`text-sm font-medium ${
                      holding.unrealizedGain >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {formatCurrency(holding.unrealizedGain)}
                  </p>
                  <p
                    className={`text-xs ${
                      holding.unrealizedGain >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {formatPercent(holding.unrealizedGainPercent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {search ? "No holdings match your search." : "No holdings found."}
          </div>
        )}
      </div>
    </div>
  );
}
