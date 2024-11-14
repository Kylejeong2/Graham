import { prisma } from "@graham/db";
import { NextResponse } from "next/server";

export async function GET( req: Request ) {
  const { agentId } = await req.json();
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
      include: {
        usageRecords: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 200 // Last 200 calls for better trend analysis
        }
      }
    });

    if (!agent) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    const records = agent.usageRecords;
    const currentPeriodRecords = records.slice(0, 100);
    const previousPeriodRecords = records.slice(100, 200);

    // Mock insights data - in production this would be calculated from actual call data
    const insightsData = {
      commonQueries: [
        { topic: "Business Hours", frequency: 35 },
        { topic: "Pricing Information", frequency: 25 },
        { topic: "Appointment Scheduling", frequency: 20 },
        { topic: "Product Availability", frequency: 15 },
        { topic: "Other Inquiries", frequency: 5 }
      ],
      peakTimes: generatePeakTimes(records),
      averageMetrics: {
        responseTime: 2.5, // seconds
        callDuration: calculateAverageCallDuration(currentPeriodRecords),
        satisfactionScore: 8.5
      },
      trends: {
        callVolume: {
          current: currentPeriodRecords.length,
          previous: previousPeriodRecords.length
        },
        successRate: {
          current: 85,
          previous: 80
        }
      }
    };

    return NextResponse.json(insightsData);
  } catch (error) {
    console.error("[INSIGHTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

function generatePeakTimes(records: any[]) {
  const hourCounts = new Array(24).fill(0);
  records.forEach(record => {
    const hour = new Date(record.timestamp).getHours();
    hourCounts[hour]++;
  });

  return hourCounts.map((calls, hour) => ({
    hour,
    calls
  }));
}

function calculateAverageCallDuration(records: any[]) {
  if (records.length === 0) return 0;
  return records.reduce((acc, curr) => acc + Number(curr.secondsUsed), 0) / records.length;
}