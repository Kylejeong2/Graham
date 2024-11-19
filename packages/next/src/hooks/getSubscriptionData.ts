import { useState, useEffect } from 'react';
import { type Subscription } from '@graham/db';

const useSubscriptions = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/getSubscriptionData');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { subscription, loading, error };
};

export default useSubscriptions;