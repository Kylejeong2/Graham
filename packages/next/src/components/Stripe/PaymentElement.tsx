import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'react-toastify'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!)

const PaymentForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userId } = useAuth()

  // Handle redirect result
  useEffect(() => {
    if (!stripe) return;

    const redirectStatus = searchParams?.get('redirect_status');
    const setupIntent = searchParams?.get('setup_intent');

    if (redirectStatus === 'succeeded' && setupIntent && userId) {
      const updatePaymentStatus = async () => {
        try {
          const response = await fetch('/api/stripe/setup-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to update payment status');
          }

          const data = await response.json();
          if (data.success) {
            toast.success('Payment method setup successfully!');
            if (pathname === '/onboarding') {
              router.push('/dashboard');
            } else {
              router.push(`/dashboard/profile/${userId}`);
            }
          }
        } catch (err) {
          toast.error('Failed to complete payment setup');
          console.error('Payment setup error:', err);
        }
      };

      updatePaymentStatus();
    }
  }, [stripe, searchParams, userId, pathname, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: stripeError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message ?? 'Failed to setup payment method')
      }

    } catch (err: any) {
      setError(err.message ?? 'An unknown error occurred')
      toast.error(err.message ?? 'Failed to setup payment method')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-blue-600 text-white p-4">
        <CardTitle className="text-xl font-semibold">Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement 
            options={{
              layout: 'tabs',
              wallets: {
                applePay: 'auto',
                googlePay: 'auto'
              }
            }} 
          />
          {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
          >
            {processing ? 'Processing...' : 'Save Payment Method'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export const PaymentElementWrapper = () => {
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    const fetchSetupIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-setup-intent', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to create setup intent')
        }
        
        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        toast.error('Failed to initialize payment setup')
      }
    }

    fetchSetupIntent()
  }, [])

  if (!clientSecret) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm />
    </Elements>
  )
}