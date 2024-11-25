import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallLogs } from "./analytics/CallLogs";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { Insights } from "./analytics/Insights";
import type { Agent } from "@graham/db";

export const AgentAnalytics: React.FC<{ agent: Agent }> = ({ agent }) => {
  return (
    <div className="w-full min-w-full space-y-6 px-2">
      <div className="w-full min-w-full bg-white">
        <Tabs defaultValue="dashboard" className="w-full min-w-full">
          <TabsList className="grid w-full min-w-full grid-cols-3">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="calls">Call Logs</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="w-full min-w-full">
            <div className="w-full min-w-full">
              <AnalyticsDashboard agent={agent} />
            </div>
          </TabsContent>
          
          <TabsContent value="calls" className="w-full min-w-full">
            <div className="w-full min-w-full">
              <CallLogs agent={agent} />
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="w-full min-w-full">
            <div className="w-full min-w-full">
              <Insights agent={agent} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};