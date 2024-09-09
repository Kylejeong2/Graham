import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);
  }
  return stripePromise;
};

export const createStripeCustomer = async (email: string) => {
  const customer = await stripe.customers.create({ email });
  return customer;
};

export const createPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
};

export const createBillingMeter = async () => {
  const meter = await stripe.billing.meters.create({
    display_name: 'Graham Phone Call Minutes',
    event_name: 'graham_phone_call_minutes',
    default_aggregation: {
      formula: 'sum',
    },
    customer_mapping: {
      event_payload_key: 'stripe_customer_id',
      type: 'by_id',
    },
    value_settings: {
      event_payload_key: 'value',
    },
  });
  return meter;
};

export const createPrice = async (meterId: string) => {
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: 4,
    billing_scheme: 'per_unit',
    transform_quantity: {
      divide_by: 1000,
      round: 'up',
    },
    recurring: {
      usage_type: 'metered',
      interval: 'month',
      meter: meterId,
    },
    product_data: {
      name: 'Graham Phone Call Minutes',
    },
  });
  return price;
};

export const createSubscription = async (customerId: string, priceId: string) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    expand: ['pending_setup_intent'],
  });
  return subscription;
};

export const createMeterEvent = async (customerId: string, value: string) => {
  const meterEvent = await stripe.billing.meterEvents.create({
    event_name: 'graham_phone_call_minutes',
    payload: {
      value: value,
      stripe_customer_id: customerId,
    },
  });
  return meterEvent;
};

export const retrieveInvoice = async (invoiceId: string) => {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
};

export const retrieveInvoiceItem = async (invoiceItemId: string) => {
  const invoiceItem = await stripe.invoiceItems.retrieve(invoiceItemId);
  return invoiceItem;
};

export const queryReportedUsage = async (meterId: string, customerId: string) => {
  const meterEventSummaries = await stripe.billing.meters.listEventSummaries(
    meterId,
    {
      customer: customerId,
      start_time: 1717249380,
      end_time: 1717249440,
    }
  );
  return meterEventSummaries;
};

export const createUsageRecord = async (subscriptionItemId: string, quantity: number) => {
  const usageRecord = await stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity,
      timestamp: 'now',
      action: 'increment',
    }
  );
  return usageRecord;
};

export const retrieveSubscriptionItem = async (subscriptionId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items'],
  });
  return subscription.items.data[0];
};