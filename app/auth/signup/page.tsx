'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState<'editor' | 'client'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const router = useRouter();

  useEffect(() => {
      setOrigin(window.location.origin);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            first_name: firstName,
            role: role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      
      if (data.user) {
        router.push('/auth/signup-success');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-4 items-center">
            <Image 
              src="/logos/f12x-logo.png" 
              alt="F12X Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              priority
            />
            <Image 
              src="/logos/magicfit-logo.png" 
              alt="Magicfit Logo"
              width={48}
              height={48}
              className="w-12 h-12"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-50 mb-2">
            <span>F12X Studio</span>
            <span className="text-lime-400"> x Magicfit</span>
          </h1>
          <p className="text-neutral-400 text-sm">Create Your Account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* First Name Input */}
            <div>
              <label htmlFor="firstName" className="block text-neutral-50 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 transition"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-neutral-50 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 transition"
                required
              />
            </div>
            
            {/* Role Input */}
            <div>
              <label htmlFor="role" className="block text-neutral-50 text-sm font-medium mb-2">
                I am a...
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'client')}
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 transition"
              >
                <option value="client">Client</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-neutral-50 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 transition"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-neutral-50 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-50 placeholder-neutral-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/50 transition"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 text-neutral-950 font-semibold py-2.5 rounded-lg hover:bg-lime-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-neutral-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-lime-400 hover:text-lime-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
