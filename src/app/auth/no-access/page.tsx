'use client';

import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NoAccessPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brandPinkPale px-4">
      <div className="max-w-sm w-full bg-white border border-line p-8 text-center rounded-sm shadow-sm">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="שבילי תקווה"
            width={60}
            height={60}
            className="rounded-full"
          />
        </div>
        <h1 className="font-display font-bold text-xl text-brand mb-3">אין לך עדיין הרשאה למערכת</h1>
        <p className="text-sm text-muted mb-6">
          החשבון שלך זוהה בהצלחה, אך עוד לא הוגדרה לו הרשאת גישה. פני/ה למנהל/ת המערכת כדי שיוסיפו אותך.
        </p>
        <button
          onClick={handleLogout}
          className="bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brandLight transition-colors rounded-sm"
        >
          התנתקות
        </button>
      </div>
    </div>
  );
}
