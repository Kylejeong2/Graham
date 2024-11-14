'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import type { Agent } from '@graham/db';
import type { InsightData } from './types/Analytics';

export const Insights = ({ agent }: { agent: Agent }) => {
  const { data: insights, isLoading } = useQuery<InsightData>({
    queryKey: ['insights', agent.id],
    queryFn: async () => {
      const res = await fetch(`/api/agent/analytics/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
        }),
      });
      return res.json();
    }
  });

  if (isLoading || !insights) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Common Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.commonQueries.map((query, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{query.topic}</span>
                  <span className="text-sm font-medium">{query.frequency}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TrendMetric
                label="Call Volume"
                current={insights.trends.callVolume.current}
                previous={insights.trends.callVolume.previous}
              />
              <TrendMetric
                label="Success Rate"
                current={insights.trends.successRate.current}
                previous={insights.trends.successRate.previous}
                isPercentage
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Response Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              label="Avg Response Time"
              value={`${insights.averageMetrics.responseTime}s`}
              icon={<Clock className="w-4 h-4" />}
            />
            <MetricCard
              label="Avg Call Duration"
              value={`${Math.floor(insights.averageMetrics.callDuration / 60)}m ${insights.averageMetrics.callDuration % 60}s`}
              icon={<MessageSquare className="w-4 h-4" />}
            />
            <MetricCard
              label="Satisfaction Score"
              value={`${insights.averageMetrics.satisfactionScore}/10`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TrendMetric = ({ 
  label, 
  current, 
  previous, 
  isPercentage = false 
}: { 
  label: string; 
  current: number; 
  previous: number; 
  isPercentage?: boolean;
}) => {
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-medium">
          {isPercentage ? `${current}%` : current}
        </span>
      </div>
      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(Math.round(change))}% from last period
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex items-center space-x-3">
    <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);