import React from 'react';
import { CallLogs } from "./analytics/CallLogs";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { Insights } from "./analytics/Insights";
import { AgentTitleBar } from "./components/AgentTitleBar";
import type { Agent } from "@graham/db";
import { useSearchParams } from 'next/navigation';

export const AgentAnalytics: React.FC<{ agent: Agent }> = ({ agent }) => {
  const searchParams = useSearchParams();
  const currentSubTab = searchParams.get('subtab') || 'dashboard';

  return (
    <div className="w-full h-full p-6">
      {currentSubTab === 'dashboard' && <AnalyticsDashboard agentId={agent.id} />}
      {currentSubTab === 'calls' && <CallLogs agent={agent} />}
      {currentSubTab === 'insights' && <Insights agent={agent} />}
    </div>
  );
};

export const AgentAnalyticsTitleBar: React.FC<{ agent: Agent }> = ({ agent }) => {
  return <AgentTitleBar agent={agent} />;
};