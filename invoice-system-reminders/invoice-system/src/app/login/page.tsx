'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('שגיאה בהתחברות. נסו שוב.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brandPinkPale px-4">
      <div className="max-w-sm w-full bg-white border border-line p-8 text-center rounded-sm shadow-sm">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="שבילי תקווה"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>
        <h1 className="font-display font-bold text-2xl text-brand mb-1">מעקב חשבוניות</h1>
        <p className="text-sm text-muted mb-8">תיכון שבילי תקווה — בית יעקב בית שאן</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-brand text-white py-3 font-medium text-sm hover:bg-brandLight transition-colors disabled:opacity-50 rounded-sm"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5c-2 1.4-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.5C41.9 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
          </svg>
          {loading ? 'מתחבר...' : 'התחברות עם Google'}
        </button>

        {error && <p className="text-overdue text-sm mt-4">{error}</p>}

        <p className="text-xs text-muted mt-6">
          כניסה עם חשבון הגוגל של התיכון או של העמותה.
        </p>
      </div>
    </div>
  );
}
