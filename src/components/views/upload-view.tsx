"use client";

import React, { useCallback, useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { ImportResult } from "@/types/portfolio";

export function UploadView() {
  const importCSV = usePortfolioStore((s) => s.importCSV);
  const isImporting = usePortfolioStore((s) => s.isImporting);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file.");
        return;
      }

      try {
        const text = await file.text();
        const importResult = importCSV(text);
        setResult(importResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse CSV");
      }
    },
    [importCSV]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Talk to Your <span className="text-primary">Portfolio</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Upload your Trade Republic CSV export to give your portfolio a voice.
            AI-native analysis, privacy-first.
          </p>
        </div>

        {/* Upload Zone */}
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("csv-input")?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                {isImporting ? "Processing..." : "Drop your CSV here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse &middot; Trade Republic transaction export
              </p>
            </div>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleInputChange}
            />
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Import Result */}
        {result && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import Summary
              </CardTitle>
              <CardDescription>
                {result.successRows} of {result.totalRows} rows imported successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-gain">{result.successRows}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-primary">{result.duplicatesSkipped}</p>
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-2xl font-bold text-destructive">{result.errors.length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    Warnings ({result.warnings.length})
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.warnings.slice(0, 10).map((w, i) => (
                      <div key={i} className="text-xs text-muted-foreground p-2 rounded bg-secondary/30">
                        <span className="text-primary">Row {w.row}:</span> {w.message}
                        {w.suggestion && (
                          <span className="text-muted-foreground/70"> — {w.suggestion}</span>
                        )}
                      </div>
                    ))}
                    {result.warnings.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...and {result.warnings.length - 10} more warnings
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    Errors ({result.errors.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.errors.map((e, i) => (
                      <div key={i} className="text-xs text-destructive/80 p-2 rounded bg-destructive/5">
                        Row {e.row}: {e.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success CTA */}
              {result.successRows > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <CheckCircle className="w-5 h-5 text-gain" />
                  <p className="text-sm text-foreground">
                    Your portfolio is ready! Navigate to the Dashboard or start talking to it.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { title: "AI-Powered", desc: "Your portfolio speaks in first person" },
            { title: "Privacy-First", desc: "Self-hosted, your data stays local" },
            { title: "ETF Look-Through", desc: "See what you really own" },
          ].map((f) => (
            <div key={f.title} className="text-center p-4 rounded-lg bg-card border">
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
