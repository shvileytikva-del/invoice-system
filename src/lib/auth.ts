import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppUser, UserRole } from '@/lib/types';

/**
 * מחזיר את המשתמש המחובר עם התפקיד שלו מתוך טבלת public.users.
 * אם אין session -> מפנה ל-/login.
 * אם יש session אבל אין שורה בטבלת users (או is_active = false) -> מפנה ל-/auth/no-access.
 */
export async function requireUser(): Promise<AppUser> {
  const supabase = createServerSupabaseClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!appUser || !appUser.is_active) {
    redirect('/auth/no-access');
  }

  return appUser as AppUser;
}

/** כמו requireUser, אבל גם דורש שהתפקיד יהיה אחד מתוך allowedRoles */
export async function requireRole(allowedRoles: UserRole[]): Promise<AppUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    redirect('/');
  }
  return user;
}
