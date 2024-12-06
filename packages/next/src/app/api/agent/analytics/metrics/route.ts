import { NextResponse } from 'next/server';
import { prisma } from "@graham/db";
import { subDays } from 'date-fns';
import { calculateCallMetrics, calculateTrends } from '@/components/Agent/analytics/utils/analytics-functions';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!agentId) {
        return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    try {
        // Get current period calls
        const currentPeriod = {
            from: startDate ? new Date(startDate) : subDays(new Date(), 30),
            to: endDate ? new Date(endDate) : new Date(),
        };

        const currentCalls = await prisma.callLog.findMany({
            where: {
                agentId,
                timestamp: {
                    gte: currentPeriod.from,
                    lte: currentPeriod.to,
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        // Get previous period calls for trend comparison
        const previousPeriodLength = currentPeriod.to.getTime() - currentPeriod.from.getTime();
        const previousPeriod = {
            from: new Date(currentPeriod.from.getTime() - previousPeriodLength),
            to: new Date(currentPeriod.to.getTime() - previousPeriodLength),
        };

        const previousCalls = await prisma.callLog.findMany({
            where: {
                agentId,
                timestamp: {
                    gte: previousPeriod.from,
                    lte: previousPeriod.to,
                },
            },
        });

        // Calculate metrics
        const currentMetrics = calculateCallMetrics(currentCalls, currentPeriod);
        const previousMetrics = calculateCallMetrics(previousCalls, previousPeriod);
        const trends = calculateTrends(currentMetrics, previousMetrics);

        // Get top performing hours
        const topHours = Object.entries(currentMetrics.callsByHour)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .reduce((acc, [hour, count]) => ({ ...acc, [hour]: count }), {});

        return NextResponse.json({
            metrics: currentMetrics,
            trends,
            topHours,
            period: {
                current: currentPeriod,
                previous: previousPeriod,
            },
        });

    } catch (error) {
        console.error('Analytics Metrics API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics metrics' }, { status: 500 });
    }
} 