import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
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

export const storeSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "mobile",
    name: "Mobile",
    descriptionPoints: [
      "Good video quality in SD (480p).",
      "Watch ad-free on any phone or tablet.",
      "Computer and TV not included.",
      "Download on 1 device.",
    ],
    stripePriceId: "price_1NsL5CSFtLfNSPgofs8MXYt3",
    price: 15,
  },
  {
    id: "basic",
    name: "Basic",
    descriptionPoints: [
      "Good video quality in HD (720).",
      "Watch ad-free on any phone, tablet, computer or TV.",
      "Download on 1 device.",
    ],

    stripePriceId: "price_1NsL6LSFtLfNSPgob8bEV80w",
    price: 25,
  },
  {
    id: "standard",
    name: "Standard",
    descriptionPoints: [
      "Great video quality in Full HD (1080p).",
      "Watch ad-free on any phone, tablet, computer or TV.",
      "Download on 2 devices.",
    ],

    stripePriceId: "price_1NsL7ZSFtLfNSPgon1dQNKAN",
    price: 40,
  },
];