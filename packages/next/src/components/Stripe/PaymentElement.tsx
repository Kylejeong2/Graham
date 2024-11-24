import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!)

const PaymentForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { userId } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      },
    })

    if (error) {
      setError(error.message ?? 'An unknown error occurred')
      setProcessing(false)
    } else {
      if (userId) {
        const response = await fetch('/api/stripe/setup-payment', {
          method: 'POST',
        });
        
        if (!response.ok) {
          setError('Failed to update payment status');
          setProcessing(false);
          return;
        }
      }
      
      if (pathname === '/onboarding') {
        router.push('/dashboard')
      } else {
        router.push(`/dashboard/profile/${userId}`)
      }
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
      const response = await fetch('/api/stripe/create-setup-intent', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setClientSecret(data.clientSecret)
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