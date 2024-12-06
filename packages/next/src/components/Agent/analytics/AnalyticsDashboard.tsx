'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "./components/DateRangePicker";
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import type { CallSentiment, CallTag } from "@graham/db";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AnalyticsDashboardProps {
  agentId: string;
}

interface AnalyticsData {
  callLogs: Array<{
    id: string;
    timestamp: string;
    duration: number;
    sentiment: CallSentiment;
    tags: CallTag[];
    summary: string;
    outcome: string;
    isResolved: boolean;
    callerNumber: string;
    secondsUsed: number;
    minutesUsed: number;
  }>;
  totalCalls: number;
  sentimentDistribution: Record<CallSentiment, number>;
  tagDistribution: Record<CallTag, number>;
  averageCallDuration: number;
  averageSecondsUsed: number;
  averageMinutesUsed: number;
  totalMinutesUsed: number;
  totalSecondsUsed: number;
  usageRecords: any[];
  dailyCallStats: Array<{
    date: string;
    calls: number;
    avgDuration: number;
    avgSecondsUsed: number;
    totalMinutes: number;
    totalUsageMinutes: number;
    totalUsageSeconds: number;
  }>;
  resolutionRate: number;
  resolvedCalls: number;
  customerSatisfaction: number;
  agent: {
    name: string;
    minutesUsed: number;
    voiceName: string;
  };
}

const COLORS = {
  primary: '#0088FE',
  success: '#00C49F',
  warning: '#FFBB28',
  error: '#FF8042',
  purple: '#8884d8',
  teal: '#82ca9d',
};

const SENTIMENT_COLORS = {
  POSITIVE: COLORS.success,
  NEUTRAL: COLORS.warning,
  NEGATIVE: COLORS.error,
};

const TAG_COLORS = {
  SALES_OPPORTUNITY: COLORS.success,
  SUPPORT_ISSUE: COLORS.warning,
  GENERAL_INQUIRY: COLORS.primary,
  COMPLAINT: COLORS.error,
  FOLLOW_UP_REQUIRED: COLORS.purple,
  RESOLVED: COLORS.teal,
  HIGH_PRIORITY: COLORS.warning,
};

export function AnalyticsDashboard({ agentId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', agentId, dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      const response = await fetch(
        `/api/agent/analytics?agentId=${agentId}&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!agentId && !!dateRange?.from && !!dateRange?.to,
  });

  const formatSentimentData = (distribution: Record<CallSentiment, number> = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
  }) => {
    return Object.entries(distribution).map(([sentiment, count]) => ({
      name: sentiment.toLowerCase(),
      value: count,
      color: SENTIMENT_COLORS[sentiment as CallSentiment],
    }));
  };

  const formatTagData = (distribution: Record<CallTag, number> = {
    SALES_OPPORTUNITY: 0,
    SUPPORT_ISSUE: 0,
    GENERAL_INQUIRY: 0,
    COMPLAINT: 0,
    FOLLOW_UP_REQUIRED: 0,
    RESOLVED: 0,
    HIGH_PRIORITY: 0,
  }) => {
    return Object.entries(distribution)
      .map(([tag, count]) => ({
        name: tag.replace(/_/g, ' ').toLowerCase(),
        value: count,
        color: TAG_COLORS[tag as CallTag],
      }))
      .sort((a, b) => b.value - a.value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[150px]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Analytics for {analyticsData?.agent.name} ({analyticsData?.agent.voiceName})
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.resolvedCalls || 0} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.resolutionRate.toFixed(1)}%
            </div>
            <Progress 
              value={analyticsData?.resolutionRate || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.customerSatisfaction.toFixed(1)}/5
            </div>
            <Progress 
              value={(analyticsData?.customerSatisfaction || 0) * 20} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.totalMinutesUsed.toFixed(1)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(analyticsData?.averageMinutesUsed || 0)}m/call
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Volume & Duration</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData?.dailyCallStats}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="calls"
                  name="Calls"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalMinutes"
                  name="Minutes Used"
                  stroke={COLORS.success}
                  fill={COLORS.success}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatSentimentData(analyticsData?.sentimentDistribution)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatSentimentData(analyticsData?.sentimentDistribution).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Tags Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatTagData(analyticsData?.tagDistribution)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={150}
                  tickFormatter={(value: string) => 
                    value.split(' ').map((word: string) => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                  }
                />
                <Tooltip />
                <Bar dataKey="value" name="Count">
                  {formatTagData(analyticsData?.tagDistribution).map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.callLogs.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{call.callerNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(call.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {call.tags.map((tag) => (
                      <Badge 
                        key={tag}
                        variant="secondary"
                        style={{ backgroundColor: TAG_COLORS[tag] + '20', color: TAG_COLORS[tag] }}
                      >
                        {tag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    <Badge
                      variant="secondary"
                      style={{ 
                        backgroundColor: SENTIMENT_COLORS[call.sentiment] + '20', 
                        color: SENTIMENT_COLORS[call.sentiment] 
                      }}
                    >
                      {call.sentiment?.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}