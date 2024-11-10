"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function ErrorWithPayment() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Payment Error</h2>
      </div>
      <p className="text-gray-600 text-center max-w-md">
        There was an error processing your payment. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={() => router.push("/dashboard")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
