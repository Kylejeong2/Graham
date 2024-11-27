import { NextResponse } from "next/server";
import { prisma } from "@graham/db";
import { auth } from "@clerk/nextjs/server";
import type { CallSentiment, CallTag } from "@graham/db";
import { startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!agentId || !startDate || !endDate) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [
      callLogs,
      usageRecords,
      totalCalls,
      sentimentDistribution,
      tagDistribution,
      avgCallDuration,
      dailyCallStats,
      resolvedCalls,
      agent,
    ] = await Promise.all([
      // Get detailed call logs with transcription for context
      prisma.callLog.findMany({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        select: {
          id: true,
          timestamp: true,
          duration: true,
          sentiment: true,
          tags: true,
          summary: true,
          outcome: true,
          isResolved: true,
          callerNumber: true,
          secondsUsed: true,
          minutesUsed: true,
        },
      }),

      // Get usage records
      prisma.usageRecord.findMany({
        where: {
          agentId,
          userId,
          recordedAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          minutes: true,
          seconds: true,
          recordedAt: true,
        },
      }),

      // Get total calls count
      prisma.callLog.count({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
        },
      }),

      // Get sentiment distribution
      prisma.callLog.groupBy({
        by: ["sentiment"],
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
        _count: true,
      }),

      // Get tag distribution
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
        },
      }),

      // Get average call duration and usage
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
          minutesUsed: true,
        },
      }),

      // Get daily call stats
      Promise.all(
        eachDayOfInterval({ start, end }).map(async (date) => {
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);

          const [calls, usage] = await Promise.all([
            prisma.callLog.aggregate({
              where: {
                agentId,
                userId,
                timestamp: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
              _count: true,
              _avg: {
                duration: true,
                secondsUsed: true,
              },
              _sum: {
                minutesUsed: true,
              },
            }),
            prisma.usageRecord.aggregate({
              where: {
                agentId,
                userId,
                recordedAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
              _sum: {
                minutes: true,
                seconds: true,
              },
            }),
          ]);

          return {
            date: format(date, 'yyyy-MM-dd'),
            calls: calls._count,
            avgDuration: calls._avg.duration || 0,
            avgSecondsUsed: calls._avg.secondsUsed || 0,
            totalMinutes: Number(calls._sum.minutesUsed || 0),
            totalUsageMinutes: Number(usage._sum.minutes || 0),
            totalUsageSeconds: Number(usage._sum.seconds || 0),
          };
        })
      ),

      // Get resolved calls count
      prisma.callLog.count({
        where: {
          agentId,
          userId,
          timestamp: {
            gte: start,
            lte: end,
          },
          isResolved: true,
        },
      }),

      // Get agent info
      prisma.agent.findUnique({
        where: { id: agentId },
        select: {
          name: true,
          minutesUsed: true,
          voiceName: true,
        },
      }),
    ]);

    // Process tag distribution
    const tagCounts: Record<CallTag, number> = {} as Record<CallTag, number>;
    tagDistribution.forEach((call) => {
      call.tags.forEach((tag: CallTag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Calculate total minutes and seconds used
    const totalMinutesUsed = usageRecords.reduce(
      (acc, record) => acc + Number(record.minutes),
      0
    );

    const totalSecondsUsed = usageRecords.reduce(
      (acc, record) => acc + Number(record.seconds),
      0
    );

    // Format sentiment distribution
    const formattedSentimentDistribution = sentimentDistribution.reduce(
      (acc, curr) => {
        acc[curr.sentiment as CallSentiment] = curr._count;
        return acc;
      },
      {} as Record<CallSentiment, number>
    );

    // Calculate resolution rate
    const resolutionRate = totalCalls > 0 ? (resolvedCalls / totalCalls) * 100 : 0;

    // Calculate customer satisfaction based on sentiment
    const totalSentimentCalls = Object.values(formattedSentimentDistribution).reduce((a, b) => a + b, 0);
    const satisfactionScore = totalSentimentCalls > 0
      ? ((formattedSentimentDistribution.POSITIVE || 0) * 5 + 
         (formattedSentimentDistribution.NEUTRAL || 0) * 3 + 
         (formattedSentimentDistribution.NEGATIVE || 0) * 1) / totalSentimentCalls
      : 0;

    return NextResponse.json({
      callLogs,
      totalCalls,
      sentimentDistribution: formattedSentimentDistribution,
      tagDistribution: tagCounts,
      averageCallDuration: avgCallDuration._avg.duration || 0,
      averageSecondsUsed: avgCallDuration._avg.secondsUsed || 0,
      averageMinutesUsed: avgCallDuration._avg.minutesUsed || 0,
      totalMinutesUsed,
      totalSecondsUsed,
      usageRecords,
      dailyCallStats,
      resolutionRate,
      resolvedCalls,
      customerSatisfaction: satisfactionScore,
      agent,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}