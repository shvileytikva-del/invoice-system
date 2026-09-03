import { requireRole } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await requireRole(['admin', 'secretary']);
  const supabase = createServerSupabaseClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('payment_status', 'paid')
    .order('payment_date', { ascending: false });

  return <ReportsClient invoices={(invoices ?? []) as Invoice[]} />;
}
