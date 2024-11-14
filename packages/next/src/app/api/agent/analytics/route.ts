import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function GET( req: Request ) {
  try {
    const { agentId } = await req.json();

    const agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
      include: {
        usageRecords: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 100 // Last 100 calls for analysis
        }
      }
    });

    if (!agent) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    // Calculate analytics from usage records
    const records = agent.usageRecords;
    const totalCalls = records.length;
    const averageDuration = records.reduce((acc, curr) => acc + Number(curr.secondsUsed), 0) / totalCalls;

    // Time distribution analysis
    const timeDistribution = calculateTimeDistribution(records);
    
    // Mock some data for now - in production, this would come from actual call analysis
    const analyticsData = {
      totalCalls,
      averageDuration,
      callsByTime: timeDistribution,
      callOutcomes: {
        appointmentsBooked: Math.floor(totalCalls * 0.3),
        ordersPlaced: Math.floor(totalCalls * 0.2),
        questionsAnswered: Math.floor(totalCalls * 0.4),
        noAction: Math.floor(totalCalls * 0.1)
      },
      recentTrends: {
        callVolume: totalCalls,
        successRate: 85
      }
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

function calculateTimeDistribution(records: any[]) {
  const hourCounts = new Array(24).fill(0);
  records.forEach(record => {
    const hour = new Date(record.timestamp).getHours();
    hourCounts[hour]++;
  });

  const morning = hourCounts.slice(5, 12).reduce((a, b) => a + b, 0);
  const afternoon = hourCounts.slice(12, 17).reduce((a, b) => a + b, 0);
  const evening = hourCounts.slice(17, 22).reduce((a, b) => a + b, 0);
  
  const total = morning + afternoon + evening;
  
  return {
    morning: Math.round((morning / total) * 100),
    afternoon: Math.round((afternoon / total) * 100),
    evening: Math.round((evening / total) * 100)
  };
}