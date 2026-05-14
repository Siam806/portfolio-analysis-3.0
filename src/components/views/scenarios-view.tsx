"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  FlaskConical,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import type { SimulationInput, SimulationResult } from "@/types/portfolio";

export function ScenariosView() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const runSimulation = usePortfolioStore((s) => s.runSimulation);

  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [selectedHolding, setSelectedHolding] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = () => {
    const amountNum = parseFloat(amount);
    if (!selectedHolding || isNaN(amountNum) || amountNum <= 0) return;

    const holding = holdings.find((h) => h.isin === selectedHolding || h.name === selectedHolding);
    if (!holding) return;

    const input: SimulationInput = {
      action,
      isin: holding.isin,
      instrumentName: holding.name,
      amount: amountNum,
      pricePerShare: holding.currentPrice,
    };

    const simResult = runSimulation(input);
    setResult(simResult);
  };

  const handleReset = () => {
    setResult(null);
    setAmount("");
    setSelectedHolding("");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Scenario Simulation</h2>
        <p className="text-sm text-muted-foreground">
          Test what-if scenarios without affecting your actual portfolio
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Create Scenario
          </CardTitle>
          <CardDescription>
            Simulate a buy or sell and see how it would affect your allocation and risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Toggle */}
          <div className="flex gap-2">
            <Button
              variant={action === "buy" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("buy")}
              className="gap-1"
            >
              <Plus className="w-3 h-3" /> Buy
            </Button>
            <Button
              variant={action === "sell" ? "default" : "outline"}
              size="sm"
              onClick={() => setAction("sell")}
              className="gap-1"
            >
              <Minus className="w-3 h-3" /> Sell
            </Button>
          </div>

          {/* Instrument Select */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Instrument</label>
            <select
              value={selectedHolding}
              onChange={(e) => setSelectedHolding(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select a holding...</option>
              {holdings.map((h) => (
                <option key={h.isin} value={h.isin}>
                  {h.name} ({h.weight.toFixed(1)}%)
                </option>
              ))}
              {action === "buy" && (
                <option value="__new__">+ New instrument</option>
              )}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Amount (EUR)</label>
            <Input
              type="number"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSimulate} className="gap-2" disabled={!selectedHolding || !amount}>
              <FlaskConical className="w-4 h-4" />
              Simulate
            </Button>
            {result && (
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Simulation Result</CardTitle>
              <CardDescription>
                {result.input.action === "buy" ? "Buying" : "Selling"}{" "}
                {formatCurrency(result.input.amount)} of {result.input.instrumentName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">Before</p>
                  <p className="text-xl font-bold">{formatCurrency(result.before.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.before.risks.length} risk flags
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs text-muted-foreground mb-1">After</p>
                  <p className="text-xl font-bold">{formatCurrency(result.after.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.after.risks.length} risk flags
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.changes.map((change, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <p className="text-sm font-medium">{change.metric}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {change.metric.includes("Weight")
                          ? `${change.before.toFixed(1)}%`
                          : formatCurrency(change.before)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold">
                        {change.metric.includes("Weight")
                          ? `${change.after.toFixed(1)}%`
                          : formatCurrency(change.after)}
                      </span>
                      <Badge
                        variant={change.delta >= 0 ? "success" : "destructive"}
                        className="text-[10px] min-w-[60px] justify-center"
                      >
                        {change.delta >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {change.metric.includes("Weight")
                          ? `${change.delta >= 0 ? "+" : ""}${change.delta.toFixed(1)}%`
                          : formatCurrency(change.delta)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Changes */}
          {result.after.risks.length !== result.before.risks.length && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Risk Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* New risks */}
                  {result.after.risks
                    .filter((r) => !result.before.risks.find((br) => br.id === r.id))
                    .map((risk) => (
                      <div key={risk.id} className="flex items-center gap-2 text-sm text-destructive">
                        <Plus className="w-3 h-3" />
                        New: {risk.title} ({risk.severity})
                      </div>
                    ))}
                  {/* Resolved risks */}
                  {result.before.risks
                    .filter((r) => !result.after.risks.find((ar) => ar.id === r.id))
                    .map((risk) => (
                      <div key={risk.id} className="flex items-center gap-2 text-sm text-gain">
                        <Minus className="w-3 h-3" />
                        Resolved: {risk.title}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            This is a simulation only. No actual trades are made. Results are based on
            current portfolio data and may not reflect real market conditions.
          </p>
        </div>
      )}

      {/* Quick Scenarios */}
      {!result && holdings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Scenarios</CardTitle>
            <CardDescription>Common what-if scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {holdings.slice(0, 4).map((h) => (
                <button
                  key={h.isin}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/50 text-left transition-colors"
                  onClick={() => {
                    setSelectedHolding(h.isin);
                    setAmount("500");
                    setAction("buy");
                  }}
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground">Buy €500</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
