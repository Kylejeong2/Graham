import { NextResponse } from "next/server";
import { prisma } from "@graham/db";
import { auth } from "@clerk/nextjs/server";
import type { CallTag } from "@graham/db";
import { CallSentiment } from "@graham/db";
import { subDays, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const startDate = searchParams.get("startDate") || subDays(new Date(), 30).toISOString();
    const endDate = searchParams.get("endDate") || new Date().toISOString();

    if (!agentId) {
      return new NextResponse("Missing agentId", { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [
      callTrends,
      topTags,
      sentimentTrends,
      peakCallTimes,
      callDurationStats,
      commonPatterns,
    ] = await Promise.all([
      // Get call trends (daily calls over time)
      prisma.callLog.groupBy({
        by: ['timestamp'],
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
        _count: true,
        orderBy: {
          timestamp: 'asc',
        },
      }),

      // Get top tags and their frequencies
      prisma.callLog.findMany({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
          tags: {
            isEmpty: false,
          },
        },
        select: {
          tags: true,
          sentiment: true,
          isResolved: true,
        },
      }),

      // Get sentiment trends over time
      prisma.callLog.findMany({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
          sentiment: {
            not: null,
          },
        },
        select: {
          sentiment: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'asc',
        },
      }),

      // Get peak call times
      prisma.callLog.findMany({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
        select: {
          timestamp: true,
          duration: true,
          isResolved: true,
        },
      }),

      // Get call duration statistics
      prisma.callLog.aggregate({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
        _avg: {
          duration: true,
          secondsUsed: true,
        },
        _max: {
          duration: true,
        },
        _min: {
          duration: true,
        },
      }),

      // Get common patterns in successful calls
      prisma.callLog.findMany({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
          isResolved: true,
          sentiment: CallSentiment.POSITIVE,
        },
        select: {
          tags: true,
          duration: true,
          sentiment: true,
        },
        take: 100, // Analyze last 100 successful calls
      }),
    ]);

    // Process tag statistics
    const tagStats = topTags.reduce((acc, call) => {
      call.tags.forEach(tag => {
        if (!acc[tag]) {
          acc[tag] = {
            count: 0,
            resolvedCount: 0,
            sentiments: {
              [CallSentiment.POSITIVE]: 0,
              [CallSentiment.NEUTRAL]: 0,
              [CallSentiment.NEGATIVE]: 0,
            },
          };
        }
        acc[tag].count++;
        if (call.isResolved) acc[tag].resolvedCount++;
        if (call.sentiment) acc[tag].sentiments[call.sentiment]++;
      });
      return acc;
    }, {} as Record<CallTag, { 
      count: number; 
      resolvedCount: number; 
      sentiments: Record<CallSentiment, number>;
    }>);

    // Process peak call times
    const hourlyDistribution = peakCallTimes.reduce((acc, call) => {
      const hour = new Date(call.timestamp).getHours();
      if (!acc[hour]) {
        acc[hour] = {
          calls: 0,
          avgDuration: 0,
          resolutionRate: 0,
          totalDuration: 0,
          resolvedCalls: 0,
        };
      }
      acc[hour].calls++;
      acc[hour].totalDuration += call.duration;
      if (call.isResolved) acc[hour].resolvedCalls++;
      return acc;
    }, {} as Record<number, {
      calls: number;
      avgDuration: number;
      resolutionRate: number;
      totalDuration: number;
      resolvedCalls: number;
    }>);

    // Calculate averages and rates for hourly distribution
    Object.keys(hourlyDistribution).forEach(hour => {
      const stats = hourlyDistribution[Number(hour)];
      stats.avgDuration = stats.totalDuration / stats.calls;
      stats.resolutionRate = (stats.resolvedCalls / stats.calls) * 100;
    });

    // Process sentiment trends
    const sentimentByDay = sentimentTrends.reduce((acc, call) => {
      const day = format(new Date(call.timestamp), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = {
          [CallSentiment.POSITIVE]: 0,
          [CallSentiment.NEUTRAL]: 0,
          [CallSentiment.NEGATIVE]: 0,
        };
      }
      if (call.sentiment) acc[day][call.sentiment]++;
      return acc;
    }, {} as Record<string, Record<CallSentiment, number>>);

    // Analyze patterns in successful calls
    const successPatterns = commonPatterns.reduce((acc, call) => {
      call.tags.forEach(tag => {
        if (!acc.commonTags[tag]) acc.commonTags[tag] = 0;
        acc.commonTags[tag]++;
      });
      acc.avgDuration += call.duration;
      return acc;
    }, { 
      commonTags: {} as Record<string, number>,
      avgDuration: 0,
    });

    successPatterns.avgDuration /= commonPatterns.length || 1;

    return NextResponse.json({
      callTrends: callTrends.map(trend => ({
        date: format(trend.timestamp, 'yyyy-MM-dd'),
        calls: trend._count,
      })),
      tagInsights: Object.entries(tagStats).map(([tag, stats]) => ({
        tag,
        count: stats.count,
        resolutionRate: (stats.resolvedCount / stats.count) * 100,
        sentimentDistribution: stats.sentiments,
      })),
      peakHours: Object.entries(hourlyDistribution).map(([hour, stats]) => ({
        hour: Number(hour),
        ...stats,
      })),
      sentimentTrends: Object.entries(sentimentByDay).map(([date, sentiments]) => ({
        date,
        ...sentiments,
      })),
      durationStats: {
        average: callDurationStats._avg.duration || 0,
        averageSecondsUsed: callDurationStats._avg.secondsUsed || 0,
        longest: callDurationStats._max.duration || 0,
        shortest: callDurationStats._min.duration || 0,
      },
      successPatterns: {
        commonTags: Object.entries(successPatterns.commonTags)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count })),
        averageDuration: successPatterns.avgDuration,
      },
    });
  } catch (error) {
    console.error("Insights API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}