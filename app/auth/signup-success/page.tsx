'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = supabase;

  useEffect(() => {
    const checkEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If email is confirmed, redirect to dashboard
        if (user.email_confirmed_at) {
          router.push('/dashboard');
        }
      }
      setIsLoading(false);
    };

    checkEmail();
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-lime-400" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-50 mb-3">Account Created!</h1>
        <p className="text-neutral-400 mb-6">
          We&apos;ve sent a confirmation email to your inbox. Please check your email and confirm your account to get started.
        </p>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 mb-6">
          <p className="text-neutral-300 text-sm">
            <span className="font-semibold">Didn&apos;t receive an email?</span> Check your spam folder or{' '}
            <button
              onClick={() => {
                // Resend verification email logic here
                alert('Resend email feature coming soon');
              }}
              className="text-lime-400 hover:text-lime-300 underline"
            >
              request a new one
            </button>
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block bg-lime-400 text-neutral-950 font-semibold px-6 py-2.5 rounded-lg hover:bg-lime-300 transition"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
