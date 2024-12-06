import { startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import type { CallLog } from '@graham/db';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface CallMetrics {
  totalCalls: number;
  averageDuration: number;
  successRate: number;
  callsByHour: { [hour: string]: number };
  callsByDay: { [date: string]: number };
  sentimentDistribution: {
    POSITIVE: number;
    NEUTRAL: number;
    NEGATIVE: number;
  };
  tagDistribution: { [tag: string]: number };
}

export function calculateCallMetrics(calls: CallLog[], dateRange: DateRange): CallMetrics {
  const filteredCalls = calls.filter(call => {
    const callDate = new Date(call.timestamp);
    return callDate >= startOfDay(dateRange.from) && callDate <= endOfDay(dateRange.to);
  });

  const totalCalls = filteredCalls.length;
  if (totalCalls === 0) {
    return {
      totalCalls: 0,
      averageDuration: 0,
      successRate: 0,
      callsByHour: {},
      callsByDay: {},
      sentimentDistribution: { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 },
      tagDistribution: {},
    };
  }

  // Calculate average duration
  const totalDuration = filteredCalls.reduce((acc, call) => acc + call.duration, 0);
  const averageDuration = totalDuration / totalCalls;

  // Calculate success rate
  const successfulCalls = filteredCalls.filter(call => 
    call.tags?.includes('RESOLVED') || 
    (call.transcription?.toLowerCase().includes('thank') && 
     call.transcription?.toLowerCase().includes('you'))
  ).length;
  const successRate = (successfulCalls / totalCalls) * 100;

  // Calculate calls by hour
  const callsByHour = filteredCalls.reduce((acc: { [hour: string]: number }, call) => {
    const hour = format(new Date(call.timestamp), 'HH:00');
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Calculate calls by day
  const daysInRange = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  const callsByDay = daysInRange.reduce((acc: { [date: string]: number }, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    acc[dateStr] = filteredCalls.filter(call => 
      format(new Date(call.timestamp), 'yyyy-MM-dd') === dateStr
    ).length;
    return acc;
  }, {});

  // Calculate sentiment distribution
  const sentimentDistribution = filteredCalls.reduce((acc, call) => {
    if (call.sentiment) {
      acc[call.sentiment] = (acc[call.sentiment] || 0) + 1;
    }
    return acc;
  }, { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 } as { POSITIVE: number; NEUTRAL: number; NEGATIVE: number });

  // Calculate tag distribution
  const tagDistribution = filteredCalls.reduce((acc: { [key: string]: number }, call) => {
    if (call.tags) {
      call.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});

  return {
    totalCalls,
    averageDuration,
    successRate,
    callsByHour,
    callsByDay,
    sentimentDistribution,
    tagDistribution,
  };
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function calculateTrends(
  currentMetrics: CallMetrics,
  previousMetrics: CallMetrics
): { [key: string]: number } {
  return {
    callVolume: calculatePercentageChange(currentMetrics.totalCalls, previousMetrics.totalCalls),
    duration: calculatePercentageChange(currentMetrics.averageDuration, previousMetrics.averageDuration),
    successRate: calculatePercentageChange(currentMetrics.successRate, previousMetrics.successRate),
    positiveRate: calculatePercentageChange(
      currentMetrics.sentimentDistribution.POSITIVE,
      previousMetrics.sentimentDistribution.POSITIVE
    ),
  };
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
} 