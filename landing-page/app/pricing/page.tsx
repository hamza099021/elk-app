'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Load PayPal SDK
  const loadPayPalScript = () => {
    if (window.paypal || paypalLoaded) return;
    
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AfYqGVqacHWy0Qe7EsvyM1BeaK4sDtyJ-pdTqSxsO2USU1wrYjRkBD7u8N9MybyXFNDathXS-gGHEMYG&vault=true&intent=subscription';
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      renderPayPalButton();
    };
    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal) return;

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: function(data: any, actions: any) {
        return actions.subscription.create({
          plan_id: 'P-7S807299SP2529011NFCWYVQ'
        });
      },
      onApprove: function(data: any, actions: any) {
        // Redirect to success page or show success message
        window.location.href = `/pricing/success?subscriptionId=${data.subscriptionID}`;
      },
      onError: function(err: any) {
        console.error('PayPal error:', err);
        setError('Payment failed. Please try again.');
      }
    }).render('#paypal-button-container');
  };

  const handleFreeSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://backend.elkai.cloud/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: email.split('@')[0], // Use email prefix as default name
          lastName: 'User',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to app or show success
      window.location.href = '/pricing/success?plan=free';
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out Elk AI',
      features: [
        { name: 'Screen Q&A', value: '10 queries/month', included: true },
        { name: 'Live Audio Transcription', value: '20 minutes/month', included: true },
        { name: 'Deep Web Queries', value: 'Not included', included: false },
        { name: 'Basic Support', value: 'Email support', included: true },
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$49',
      description: 'For professionals who need more power',
      features: [
        { name: 'Screen Q&A', value: '900 queries/month', included: true },
        { name: 'Live Audio Transcription', value: '10 hours/month', included: true },
        { name: 'Deep Web Queries', value: '100 queries/month', included: true },
        { name: 'Priority Support', value: '24/7 support', included: true },
      ],
      cta: 'Subscribe with PayPal',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-white">
            Elk AI
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="/#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="/#faq" className="text-gray-300 hover:text-white transition">FAQ</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start with our free plan or unlock full power with Pro
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105'
                  : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-3xl font-bold text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-medium">{feature.name}</p>
                      <p className={`text-sm ${feature.included ? 'text-gray-400' : 'text-red-400'}`}>
                        {feature.value}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                {index === 0 ? (
                  // Free Plan - Email/Password Form
                  <form onSubmit={handleFreeSignup} className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      {loading ? 'Creating Account...' : plan.cta}
                    </Button>
                  </form>
                ) : (
                  // Pro Plan - PayPal Button
                  <div className="w-full">
                    <div id="paypal-button-container"></div>
                    {!paypalLoaded && (
                      <Button
                        onClick={loadPayPalScript}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 text-sm">
            All plans include our core features. Upgrade anytime to unlock more.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Elk AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
