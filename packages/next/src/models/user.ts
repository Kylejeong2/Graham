import { User } from "@clerk/nextjs/server";

export interface ExtendedUser extends User {
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
}

export default ExtendedUser;