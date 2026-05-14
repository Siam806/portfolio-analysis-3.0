"use client";

import React from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Sidebar } from "./sidebar";
import { UploadView } from "./views/upload-view";
import { DashboardView } from "./views/dashboard-view";
import { HoldingsView } from "./views/holdings-view";
import { ExposureView } from "./views/exposure-view";
import { RisksView } from "./views/risks-view";
import { ChatView } from "./views/chat-view";
import { ScenariosView } from "./views/scenarios-view";
import { ReportsView } from "./views/reports-view";
import { SettingsView } from "./views/settings-view";

const VIEW_MAP: Record<string, React.ComponentType> = {
  upload: UploadView,
  dashboard: DashboardView,
  chat: ChatView,
  holdings: HoldingsView,
  exposure: ExposureView,
  risks: RisksView,
  scenarios: ScenariosView,
  reports: ReportsView,
  settings: SettingsView,
};

export function AppShell() {
  const activeView = usePortfolioStore((s) => s.activeView);
  const ActiveComponent = VIEW_MAP[activeView] || UploadView;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <ActiveComponent />
      </main>
    </div>
  );
}
