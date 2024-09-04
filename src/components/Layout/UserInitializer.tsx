'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function UserInitializer() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch('/api/user/init', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('User initialization:', data))
        .catch(error => console.error('Error initializing user:', error));
    }
  }, [isLoaded, isSignedIn]);

  return null; // This component doesn't render anything
}