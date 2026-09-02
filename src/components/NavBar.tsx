'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AppUser } from '@/lib/types';
import { roleLabel } from '@/lib/utils';

export default function NavBar({ user }: { user: AppUser }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const links: { href: string; label: string; roles: AppUser['role'][] }[] = [
    { href: '/', label: 'Dashboard', roles: ['secretary', 'admin'] },
    { href: '/my-invoices', label: 'החשבוניות שלי', roles: ['school_user'] },
    { href: '/invoices/new', label: 'חשבונית חדשה', roles: ['school_user', 'secretary', 'admin'] },
    { href: '/reports', label: 'דוחות', roles: ['admin', 'secretary'] },
    { href: '/admin/users', label: 'ניהול משתמשים', roles: ['admin'] },
  ];

  return (
    <div className="border-b-2 border-ink bg-paper">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap px-5 py-4">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="font-display font-bold text-xl">מעקב חשבוניות</span>
          <nav className="flex gap-4 flex-wrap">
            {links
              .filter((l) => l.roles.includes(user.role))
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-ink hover:underline underline-offset-4"
                >
                  {l.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted text-left">
            <div className="font-medium text-ink">{user.name}</div>
            <div>{roleLabel(user.role)}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs border border-ink px-3 py-1.5 hover:bg-ink hover:text-white transition-colors"
          >
            התנתקות
          </button>
        </div>
      </div>
    </div>
  );
}
