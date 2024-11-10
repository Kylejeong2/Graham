'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An error occurred';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex items-center gap-2 text-red-600 mb-4">
        <AlertCircle className="w-8 h-8" />
        <h1 className="text-2xl font-semibold">Error</h1>
      </div>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
    </div>
  );
}
