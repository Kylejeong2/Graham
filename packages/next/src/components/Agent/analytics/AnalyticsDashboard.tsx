'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PhoneCall, Clock, TrendingUp } from 'lucide-react';
import type { Agent } from '@graham/db';
import type { AnalyticsData } from './types/Analytics';

export const AnalyticsDashboard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', agent.id],
    queryFn: async () => {
      const res = await fetch(`/api/agent/analytics`, {
        body: JSON.stringify({
          agentId: agent.id,
        }),
      });
      return res.json();
    }
  });

  if (isLoading || !analytics) {
    return <div className="w-full min-w-full h-[600px] flex items-center justify-center">Loading analytics...</div>;
  }

  return (
    <div className="w-full min-w-full space-y-6">
      <div className="w-full min-w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Calls"
          value={analytics.totalCalls.toString()}
          icon={<PhoneCall className="w-4 h-4" />}
          trend="+12% from last month"
        />
        <StatsCard
          title="Average Duration"
          value={`${Math.floor(analytics.averageDuration / 60)}m ${analytics.averageDuration % 60}s`}
          icon={<Clock className="w-4 h-4" />}
          trend="-8% from last month"
        />
        <StatsCard
          title="Success Rate"
          value={`${analytics.recentTrends.successRate}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend="+5% from last month"
        />
      </div>

      <div className="w-full min-w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Call Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimeDistribution label="Morning" value={analytics.callsByTime.morning} />
              <TimeDistribution label="Afternoon" value={analytics.callsByTime.afternoon} />
              <TimeDistribution label="Evening" value={analytics.callsByTime.evening} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OutcomeBar 
                label="Appointments" 
                value={analytics.callOutcomes.appointmentsBooked} 
                total={analytics.totalCalls}
                color="bg-green-500"
              />
              <OutcomeBar 
                label="Orders" 
                value={analytics.callOutcomes.ordersPlaced} 
                total={analytics.totalCalls}
                color="bg-blue-500"
              />
              <OutcomeBar 
                label="Questions" 
                value={analytics.callOutcomes.questionsAnswered} 
                total={analytics.totalCalls}
                color="bg-orange-500"
              />
              <OutcomeBar 
                label="No Action" 
                value={analytics.callOutcomes.noAction} 
                total={analytics.totalCalls}
                color="bg-gray-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  trend: string;
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-full">{icon}</div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{trend}</p>
    </CardContent>
  </Card>
);

const TimeDistribution = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

const OutcomeBar = ({ label, value, total, color }: { 
  label: string; 
  value: number; 
  total: number;
  color: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>{Math.round((value / total) * 100)}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color}`} 
        style={{ width: `${(value / total) * 100}%` }}
      />
    </div>
  </div>
);