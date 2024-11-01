'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function CreatingAccountPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/user/init', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to initialize user');
        }

        // Successfully initialized, redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error initializing user:', error);
        // Could add error handling here, like redirecting to an error page
        router.push('/error');
      }
    };

    initializeUser();
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <h1 className="text-2xl font-semibold text-blue-900">Setting up your account...</h1>
        <p className="text-blue-600">Just a moment while we get everything ready.</p>
      </div>
    </div>
  );
}
