'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-neutral-50 mb-3">Authentication Error</h1>
        <p className="text-neutral-400 mb-6">
          {error ? `Error: ${error}` : 'An error occurred during authentication. Please try again.'}
        </p>

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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <ErrorContent />
    </Suspense>
  );
}
