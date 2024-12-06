import { NextResponse } from 'next/server';
import { BillingStatus, prisma } from "@graham/db";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-08-16'
});

const RATE_PER_MINUTE = 0.25; // 25 cents per minute

export async function GET() {
  try {
    // Get all usage records for the previous month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfPrevMonth = new Date(firstDayOfMonth.getTime() - 1);
    const firstDayOfPrevMonth = new Date(lastDayOfPrevMonth.getFullYear(), lastDayOfPrevMonth.getMonth(), 1);

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        recordedAt: {
          gte: firstDayOfPrevMonth,
          lt: firstDayOfMonth,
        },
        billed: false,
      },
      include: {
        user: true,
      },
    });

    // Group usage by user
    const usageByUser = usageRecords.reduce((acc, record) => {
      const userId = record.userId;
      if (!acc[userId]) {
        acc[userId] = {
          totalMinutes: 0,
          user: record.user,
          records: [],
        };
      }
      acc[userId].totalMinutes += record.minutes;
      acc[userId].records.push(record.id);
      return acc;
    }, {} as Record<string, { totalMinutes: number; user: any; records: string[] }>);

    // Process billing for each user
    for (const [userId, usage] of Object.entries(usageByUser)) {
      const amountInCents = Math.round(usage.totalMinutes * RATE_PER_MINUTE * 100);
      
      if (amountInCents === 0) continue;

      try {
        // Create invoice item
        await stripe.invoiceItems.create({
          customer: usage.user.stripeCustomerId,
          amount: amountInCents,
          currency: 'usd',
          description: `Graham usage for ${firstDayOfPrevMonth.toLocaleString('default', { month: 'long' })} ${firstDayOfPrevMonth.getFullYear()}`,
        });

        // Create and finalize invoice
        const invoice = await stripe.invoices.create({
          customer: usage.user.stripeCustomerId,
          auto_advance: true,
        });

        // Mark usage records as billed
        await prisma.usageRecord.updateMany({
          where: {
            id: {
              in: usage.records,
            },
          },
          data: {
            billed: true,
            billingRecordId: invoice.id,
          },
        });

        // Create billing record
        await prisma.billingRecord.create({
          data: {
            userId,
            amountCents: amountInCents,
            stripeInvoiceId: invoice.id,
            status: BillingStatus.PENDING,
            billingPeriodStart: firstDayOfPrevMonth,
            billingPeriodEnd: lastDayOfPrevMonth,
          },
        });
      } catch (error) {
        console.error(`Failed to bill user ${userId}:`, error);
        // Continue with other users even if one fails TODO: should add retries
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Monthly billing processed successfully' 
    });
  } catch (error) {
    console.error('Monthly billing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Monthly billing failed' },
      { status: 500 }
    );
  }
} 