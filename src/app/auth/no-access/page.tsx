'use client';

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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="max-w-sm w-full border border-line bg-white p-8 text-center">
        <h1 className="font-display font-bold text-xl mb-3">אין לך עדיין הרשאה למערכת</h1>
        <p className="text-sm text-muted mb-6">
          החשבון שלך זוהה בהצלחה, אך עוד לא הוגדרה לו הרשאת גישה. פני/ה למנהל/ת המערכת כדי שיוסיפו אותך.
        </p>
        <button
          onClick={handleLogout}
          className="border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-white transition-colors"
        >
          התנתקות
        </button>
      </div>
    </div>
  );
}
