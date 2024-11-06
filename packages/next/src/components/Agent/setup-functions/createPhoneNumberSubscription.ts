import { toast } from "react-toastify";

export const createPhoneNumberSubscription = async (phoneNumber: string, userId: string, agentId: string, stripeCustomerId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: process.env.STRIPE_PHONE_NUMBER_PLAN_ID!,
          userId: userId,
          stripeCustomerId: stripeCustomerId,
          successUrl: `${window.location.origin}/dashboard/agent/${agentId}`,
          cancelUrl: `${window.location.origin}/dashboard/error-with-payment`,
          quantity: 1,
          metadata: {
            phoneNumber
          }
        })
      });
  
      const { url } = await response.json();

      if (url) {
        if(url.includes('agent')) {
            const response = await fetch('/api/twilio/buy-phone-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    phoneNumber,
                })
            });
            const data = await response.json();
            if (!response.ok) {
            throw new Error(data.error || 'Failed to purchase number');
          }
        }
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }

      return { success: true, number: phoneNumber };
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment');
    }
  };