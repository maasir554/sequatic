'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { WavyBackground } from '@/components/ui/wavy-background';
import { Github } from 'lucide-react';

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/onboarding' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <WavyBackground
        backgroundFill={"white"}
        colors={["#f0b100", "white", "#658ef6"]}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/sequatic-flat-blue.svg"
              alt="Sequatic Logo"
              width={150}
              height={40}
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">
              Sign up with your Google or GitHub account to get started with verified credentials
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              variant="outline"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.707-6.735-2.707-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.326 10-10 0-0.665-0.057-1.193-0.159-1.728h-9.841z"></path>
              </svg>
              {isLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              variant="outline"
            >
              <Github className="h-5 w-5 mr-3" />
              {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy.
              Your account will be verified through the selected OAuth provider.
            </p>
          </div>
        </div>
      </WavyBackground>
    </div>
  );
}