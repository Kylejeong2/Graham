import cron from 'node-cron'
import { BillingService } from '@/lib/billing/BillingService'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

const billingService = new BillingService(process.env.STRIPE_SECRET_KEY)

// Run at midnight on the 1st of every month
cron.schedule('0 0 1 * *', async () => {
  console.log('Starting monthly billing process...')
  try {
    await billingService.createMonthlyInvoices()
    console.log('Monthly billing process completed successfully')
  } catch (error) {
    console.error('Error in monthly billing process:', error)
  }
})