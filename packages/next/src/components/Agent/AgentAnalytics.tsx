import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallLogs } from "./analytics/CallLogs";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { Insights } from "./analytics/Insights";
import type { Agent } from "@graham/db";

export const AgentAnalytics: React.FC<{ agent: Agent }> = ({ agent }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="calls">Call Logs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <AnalyticsDashboard agent={agent} />
        </TabsContent>
        
        <TabsContent value="calls">
          <CallLogs agent={agent} />
        </TabsContent>
        
        <TabsContent value="insights">
          <Insights agent={agent} />
        </TabsContent>
      </Tabs>
    </div>
  );
};