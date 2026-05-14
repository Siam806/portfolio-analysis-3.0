"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Key,
  Brain,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Globe,
} from "lucide-react";

export function SettingsView() {
  const aiConfig = usePortfolioStore((s) => s.aiConfig);
  const updateAIConfig = usePortfolioStore((s) => s.updateAIConfig);
  const personalityConfig = usePortfolioStore((s) => s.personalityConfig);
  const updatePersonalityConfig = usePortfolioStore((s) => s.updatePersonalityConfig);
  const riskThresholds = usePortfolioStore((s) => s.riskThresholds);
  const updateRiskThresholds = usePortfolioStore((s) => s.updateRiskThresholds);
  const strategyProfile = usePortfolioStore((s) => s.strategyProfile);
  const updateStrategyProfile = usePortfolioStore((s) => s.updateStrategyProfile);
  const clearAllData = usePortfolioStore((s) => s.clearAllData);
  const transactions = usePortfolioStore((s) => s.transactions);

  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(aiConfig.apiKey);
  const [saved, setSaved] = useState(false);

  const handleSaveAI = () => {
    updateAIConfig({
      apiKey: tempKey,
      enabled: tempKey.length > 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure AI provider, personality, risk thresholds, and privacy
        </p>
      </div>

      {/* AI Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            AI Provider Configuration
          </CardTitle>
          <CardDescription>
            Connect an LLM provider to enable AI features. Your API key is stored locally only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Provider</label>
            <select
              value={aiConfig.provider}
              onChange={(e) =>
                updateAIConfig({ provider: e.target.value as any })
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom (OpenAI-compatible)</option>
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Model</label>
            <Input
              value={aiConfig.model}
              onChange={(e) => updateAIConfig({ model: e.target.value })}
              placeholder="e.g. gemini-2.0-flash"
            />
          </div>

          {/* Base URL (for custom) */}
          {(aiConfig.provider === "custom" || aiConfig.provider === "openai" || aiConfig.provider === "anthropic") && (
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Base URL</label>
              <Input
                value={aiConfig.baseUrl || ""}
                onChange={(e) => updateAIConfig({ baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          )}

          {/* API Key */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Enter your API key..."
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleSaveAI} className="gap-1">
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Saved
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {aiConfig.enabled ? (
              <>
                <CheckCircle className="w-4 h-4 text-gain" />
                <span className="text-sm text-gain">AI features enabled</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">AI features disabled — add an API key</span>
              </>
            )}
          </div>

          {/* Privacy notice */}
          <div className="p-3 rounded-lg bg-secondary/30 border">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy Notice:</strong> When AI features are enabled, your portfolio data
              (holdings, allocations, risk metrics) is sent to the selected LLM provider for analysis.
              Your API key is stored locally in your browser and is never transmitted to our servers.
              Core portfolio analysis works entirely offline without AI.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Personality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Portfolio Personality
          </CardTitle>
          <CardDescription>
            Customize how your portfolio communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Temperament */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Risk Temperament</label>
            <div className="flex gap-2">
              {(["conservative", "balanced", "adventurous"] as const).map((val) => (
                <Button
                  key={val}
                  variant={personalityConfig.riskTemperament === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePersonalityConfig({ riskTemperament: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Communication Style</label>
            <div className="flex gap-2">
              {(["professional", "friendly", "casual"] as const).map((val) => (
                <Button
                  key={val}
                  variant={personalityConfig.communicationStyle === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePersonalityConfig({ communicationStyle: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>

          {/* Technical Level */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Technical Level</label>
            <div className="flex gap-2">
              {(["beginner", "intermediate", "advanced"] as const).map((val) => (
                <Button
                  key={val}
                  variant={personalityConfig.technicalLevel === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePersonalityConfig({ technicalLevel: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>

          {/* Proactivity */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Proactivity</label>
            <div className="flex gap-2">
              {(["reactive", "balanced", "proactive"] as const).map((val) => (
                <Button
                  key={val}
                  variant={personalityConfig.proactivity === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePersonalityConfig({ proactivity: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Risk Thresholds
          </CardTitle>
          <CardDescription>
            Configure when risk warnings trigger
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "maxCryptoPercent", label: "Max Crypto %", min: 0, max: 100 },
            { key: "maxSingleStockPercent", label: "Max Single Stock %", min: 0, max: 100 },
            { key: "maxSingleSectorPercent", label: "Max Sector %", min: 0, max: 100 },
            { key: "maxSingleRegionPercent", label: "Max Region %", min: 0, max: 100 },
            { key: "minHoldingsCount", label: "Min Holdings Count", min: 1, max: 50 },
            { key: "maxEtfOverlapPercent", label: "Max ETF Overlap %", min: 0, max: 100 },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="text-sm">{item.label}</label>
              <Input
                type="number"
                value={(riskThresholds as any)[item.key]}
                onChange={(e) =>
                  updateRiskThresholds({ [item.key]: parseFloat(e.target.value) || 0 })
                }
                min={item.min}
                max={item.max}
                className="w-24 text-center"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strategy Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Investment Strategy
          </CardTitle>
          <CardDescription>
            Define your investment preferences for personalized analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Tolerance */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Risk Tolerance</label>
            <div className="flex gap-2">
              {(["conservative", "moderate", "aggressive"] as const).map((val) => (
                <Button
                  key={val}
                  variant={strategyProfile.riskTolerance === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStrategyProfile({ riskTolerance: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Horizon */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Investment Horizon</label>
            <div className="flex gap-2">
              {(["short", "medium", "long"] as const).map((val) => (
                <Button
                  key={val}
                  variant={strategyProfile.investmentHorizon === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStrategyProfile({ investmentHorizon: val })}
                  className="capitalize"
                >
                  {val} term
                </Button>
              ))}
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="flex items-center justify-between">
            <label className="text-sm">Monthly Contribution (EUR)</label>
            <Input
              type="number"
              value={strategyProfile.monthlyContribution}
              onChange={(e) =>
                updateStrategyProfile({
                  monthlyContribution: parseFloat(e.target.value) || 0,
                })
              }
              className="w-32 text-center"
              min={0}
            />
          </div>

          {/* Crypto Comfort */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Crypto Comfort Level</label>
            <div className="flex gap-2">
              {(["none", "low", "medium", "high"] as const).map((val) => (
                <Button
                  key={val}
                  variant={strategyProfile.cryptoComfortLevel === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateStrategyProfile({ cryptoComfortLevel: val })}
                  className="capitalize"
                >
                  {val}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your locally stored portfolio data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Stored Transactions</p>
              <p className="text-xs text-muted-foreground">
                {transactions.length} transactions in local storage
              </p>
            </div>
            <Badge variant="outline">{transactions.length}</Badge>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure? This will delete all portfolio data, chat history, and settings.")) {
                clearAllData();
              }
            }}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
