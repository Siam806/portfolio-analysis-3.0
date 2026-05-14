"use client";

import React, { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  FileText,
  Download,
  Copy,
  CheckCircle,
  Heart,
  ShieldAlert,
  PieChart,
  Globe,
} from "lucide-react";

function generateMarkdownReport(store: ReturnType<typeof usePortfolioStore.getState>): string {
  const { summary, holdings, exposure, risks, strategyProfile } = store;
  if (!summary) return "# No Portfolio Data\n\nPlease import a CSV file first.";

  const now = new Date().toLocaleString("de-DE");

  let md = `# Portfolio Analysis Report\n\n`;
  md += `**Generated:** ${now}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## Portfolio Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Total Value | ${formatCurrency(summary.totalValue)} |\n`;
  md += `| Total Cost | ${formatCurrency(summary.totalCost)} |\n`;
  md += `| Total Gain/Loss | ${formatCurrency(summary.totalGain)} (${formatPercent(summary.totalGainPercent)}) |\n`;
  md += `| Holdings | ${summary.holdingsCount} |\n`;
  md += `| Dividends Received | ${formatCurrency(summary.totalDividends)} |\n`;
  md += `| Fees & Taxes | ${formatCurrency(summary.totalFees + summary.totalTaxes)} |\n\n`;

  // Holdings
  md += `## Holdings\n\n`;
  md += `| Name | Asset Class | Value | Weight | Gain/Loss |\n|---|---|---|---|---|\n`;
  for (const h of holdings) {
    md += `| ${h.name} | ${h.assetClass} | ${formatCurrency(h.currentValue)} | ${h.weight.toFixed(1)}% | ${formatCurrency(h.unrealizedGain)} |\n`;
  }
  md += `\n`;

  // Exposure
  if (exposure) {
    md += `## Geographic Exposure\n\n`;
    md += `| Region | Weight | Source |\n|---|---|---|\n`;
    for (const e of exposure.geographic.slice(0, 10)) {
      md += `| ${e.name} | ${e.percent.toFixed(1)}% | ${e.source} |\n`;
    }
    md += `\n`;

    md += `## Sector Exposure\n\n`;
    md += `| Sector | Weight | Source |\n|---|---|---|\n`;
    for (const e of exposure.sector.slice(0, 10)) {
      md += `| ${e.name} | ${e.percent.toFixed(1)}% | ${e.source} |\n`;
    }
    md += `\n`;

    md += `## Top Company Exposure (incl. ETF Look-Through)\n\n`;
    md += `| Company | Weight | Source |\n|---|---|---|\n`;
    for (const e of exposure.company.slice(0, 15)) {
      md += `| ${e.name} | ${e.percent.toFixed(1)}% | ${e.source} |\n`;
    }
    md += `\n`;
  }

  // Risks
  md += `## Risk Assessment\n\n`;
  if (risks.length === 0) {
    md += `No risk flags detected.\n\n`;
  } else {
    md += `| Risk | Severity | Current | Threshold |\n|---|---|---|---|\n`;
    for (const r of risks) {
      md += `| ${r.title} | ${r.severity} | ${r.currentValue.toFixed(1)} | ${r.threshold} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*This report is for educational and informational purposes only. It does not constitute financial advice. All calculations are based on imported transaction data and may not reflect current market values.*\n`;

  return md;
}

export function ReportsView() {
  const store = usePortfolioStore.getState();
  const summary = usePortfolioStore((s) => s.summary);
  const holdings = usePortfolioStore((s) => s.holdings);
  const risks = usePortfolioStore((s) => s.risks);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    const report = generateMarkdownReport(usePortfolioStore.getState());
    setReportContent(report);
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!reportContent) return;
    await navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-report-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No portfolio data. Please import a CSV first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Generate and export portfolio reports
          </p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Heart, label: "Health Report", desc: "Full portfolio health review" },
          { icon: ShieldAlert, label: "Risk Report", desc: "Detailed risk analysis" },
          { icon: PieChart, label: "Allocation Report", desc: "Holdings & allocation" },
          { icon: Globe, label: "Exposure Report", desc: "Geographic & sector exposure" },
        ].map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.label}
              className="cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={handleGenerate}
            >
              <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generated Report */}
      {reportContent && (
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Generated Report
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("de-DE")} &middot; Markdown format
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                  {copied ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-gain" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </Button>
                <Button size="sm" onClick={handleDownload} className="gap-1">
                  <Download className="w-3 h-3" /> Download .md
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-4 overflow-auto max-h-[500px] whitespace-pre-wrap font-mono">
              {reportContent}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Report Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold">{holdings.length}</p>
              <p className="text-xs text-muted-foreground">Holdings</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold">{risks.length}</p>
              <p className="text-xs text-muted-foreground">Risk Flags</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 text-center">
              <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
