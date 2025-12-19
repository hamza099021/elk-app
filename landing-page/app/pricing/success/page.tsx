'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscriptionId');
  const plan = searchParams.get('plan');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to app download or login page
          window.location.href = 'https://backend.elkai.cloud';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          {plan === 'free' ? 'Account Created!' : 'Subscription Successful!'}
        </h1>

        <p className="text-gray-400 mb-6">
          {plan === 'free' 
            ? 'Your free account has been created successfully.'
            : `Your subscription has been activated. Subscription ID: ${subscriptionId}`
          }
        </p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400">
            Redirecting to the app in <span className="text-white font-bold">{countdown}</span> seconds...
          </p>
        </div>

        <Button
          onClick={() => window.location.href = 'https://backend.elkai.cloud'}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
        >
          Go to App Now
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
