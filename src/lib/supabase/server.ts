import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createRawClient } from '@supabase/supabase-js';

// לשימוש בתוך Server Components, Server Actions ו-API Routes.
// פועל עם ה-anon key, ומכבד את משתמש ה-session (ולכן גם את מדיניות ה-RLS).
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // אפשר להתעלם - קורה כשקוראים מתוך Server Component בלבד (לא Route Handler)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // ראה הערה למעלה
          }
        },
      },
    }
  );
}

// לקוח עם הרשאת service_role - עוקף RLS לגמרי.
// שימוש אך ורק בתוך API routes, לפעולות מבוקרות (כמו כתיבה ל-activity_log),
// ולעולם לא לחשוף אותו או ליצור אותו בצד הלקוח.
export function createServiceRoleClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
