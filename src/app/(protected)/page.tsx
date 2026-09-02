import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { computeInvoiceFlags } from '@/lib/types';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await requireUser();

  if (user.role === 'school_user') {
    redirect('/my-invoices');
  }

  const supabase = createServerSupabaseClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, uploader:users!uploaded_by(name)')
    .order('uploaded_at', { ascending: false });

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, name')
    .eq('is_active', true);

  const enriched = (invoices ?? []).map((inv: any) => {
    const { is_overdue, is_completed } = computeInvoiceFlags(inv);
    return {
      ...inv,
      is_overdue,
      is_completed,
      uploader_name: inv.uploader?.name ?? '—',
    };
  });

  const uploaders = (allUsers ?? []).map((u: any) => ({ id: u.id, name: u.name }));

  return <DashboardClient invoices={enriched} uploaders={uploaders} userRole={user.role} />;
}
