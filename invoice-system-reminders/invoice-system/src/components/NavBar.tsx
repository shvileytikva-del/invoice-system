'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    { href: '/', label: 'לוח בקרה', roles: ['secretary', 'admin'] },
    { href: '/my-invoices', label: 'החשבוניות שלי', roles: ['school_user'] },
    { href: '/invoices/new', label: 'חשבונית חדשה', roles: ['school_user', 'secretary', 'admin'] },
    { href: '/reports', label: 'דוחות', roles: ['admin', 'secretary'] },
    { href: '/admin/users', label: 'ניהול משתמשים', roles: ['admin'] },
  ];

  return (
    <div className="bg-brand text-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap px-5 py-3">
        <div className="flex items-center gap-5 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="שבילי תקווה"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-display font-bold text-lg">מעקב חשבוניות</span>
          </Link>
          <nav className="flex gap-4 flex-wrap">
            {links
              .filter((l) => l.roles.includes(user.role))
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-left">
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-white/60">{roleLabel(user.role)}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs border border-white/30 px-3 py-1.5 hover:bg-white/10 transition-colors rounded-sm"
          >
            התנתקות
          </button>
        </div>
      </div>
    </div>
  );
}
