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
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface InsightsProps {
  agent: {
    id: string;
    name: string;
  };
}

interface InsightsData {
  callTrends: Array<{
    date: string;
    calls: number;
  }>;
  tagInsights: Array<{
    tag: string;
    count: number;
    resolutionRate: number;
    sentimentDistribution: Record<CallSentiment, number>;
  }>;
  peakHours: Array<{
    hour: number;
    calls: number;
    avgDuration: number;
    resolutionRate: number;
  }>;
  sentimentTrends: Array<{
    date: string;
    POSITIVE: number;
    NEUTRAL: number;
    NEGATIVE: number;
  }>;
  durationStats: {
    average: number;
    averageSecondsUsed: number;
    longest: number;
    shortest: number;
  };
  successPatterns: {
    commonTags: Array<{
      tag: string;
      count: number;
    }>;
    averageDuration: number;
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

const TAG_COLORS = {
  SALES_OPPORTUNITY: COLORS.success,
  SUPPORT_ISSUE: COLORS.warning,
  GENERAL_INQUIRY: COLORS.primary,
  COMPLAINT: COLORS.error,
  FOLLOW_UP_REQUIRED: COLORS.purple,
  RESOLVED: COLORS.teal,
  HIGH_PRIORITY: COLORS.warning,
};

const SENTIMENT_COLORS = {
  POSITIVE: COLORS.success,
  NEUTRAL: COLORS.warning,
  NEGATIVE: COLORS.error,
};

export function Insights({ agent }: InsightsProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: insightsData, isLoading } = useQuery<InsightsData>({
    queryKey: ['insights', agent.id, dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      const response = await fetch(
        `/api/agent/analytics/insights?agentId=${agent.id}&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
    enabled: !!agent.id && !!dateRange?.from && !!dateRange?.to,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-4 w-[200px]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px]" />
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
          <h2 className="text-2xl font-bold tracking-tight">Insights & Analysis</h2>
          <p className="text-muted-foreground">
            Detailed analytics and patterns for {agent.name}
          </p>
        </div>
        <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Call Volume Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Call Volume Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insightsData?.callTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insightsData?.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour"
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                />
                <Bar dataKey="calls" fill={COLORS.primary}>
                  {insightsData?.peakHours.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.resolutionRate > 80 ? COLORS.success : COLORS.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sentiment Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={insightsData?.sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="POSITIVE"
                  stackId="1"
                  stroke={SENTIMENT_COLORS.POSITIVE}
                  fill={SENTIMENT_COLORS.POSITIVE}
                  fillOpacity={0.2}
                  name="Positive"
                />
                <Area
                  type="monotone"
                  dataKey="NEUTRAL"
                  stackId="1"
                  stroke={SENTIMENT_COLORS.NEUTRAL}
                  fill={SENTIMENT_COLORS.NEUTRAL}
                  fillOpacity={0.2}
                  name="Neutral"
                />
                <Area
                  type="monotone"
                  dataKey="NEGATIVE"
                  stackId="1"
                  stroke={SENTIMENT_COLORS.NEGATIVE}
                  fill={SENTIMENT_COLORS.NEGATIVE}
                  fillOpacity={0.2}
                  name="Negative"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tag Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Tag Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insightsData?.tagInsights.map((tag) => (
                <div key={tag.tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      style={{ 
                        backgroundColor: TAG_COLORS[tag.tag as CallTag] + '20',
                        color: TAG_COLORS[tag.tag as CallTag],
                      }}
                    >
                      {tag.tag.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm font-medium">{tag.count} calls</span>
                  </div>
                  <Progress value={tag.resolutionRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resolution Rate</span>
                    <span>{tag.resolutionRate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Success Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Most Common Tags in Successful Calls</p>
                {insightsData?.successPatterns.commonTags.map((tag) => (
                  <div key={tag.tag} className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      style={{ 
                        backgroundColor: TAG_COLORS[tag.tag as CallTag] + '20',
                        color: TAG_COLORS[tag.tag as CallTag],
                      }}
                    >
                      {tag.tag.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm">{tag.count} times</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Average Duration of Successful Calls</p>
                <p className="text-2xl font-bold">
                  {Math.round(insightsData?.successPatterns.averageDuration || 0)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Call Duration Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Average Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(insightsData?.durationStats.average || 0)}s
                </p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(insightsData?.durationStats.averageSecondsUsed || 0)}s active time
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Duration Range</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Shortest</p>
                    <p className="text-lg font-bold">
                      {Math.round(insightsData?.durationStats.shortest || 0)}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Longest</p>
                    <p className="text-lg font-bold">
                      {Math.round(insightsData?.durationStats.longest || 0)}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}