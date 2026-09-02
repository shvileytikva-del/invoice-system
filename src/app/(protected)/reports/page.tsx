import { requireRole } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/utils';
import type { Invoice } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  await requireRole(['admin', 'secretary']);
  const supabase = createServerSupabaseClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('payment_status', 'paid')
    .order('payment_date', { ascending: false });

  const paidInvoices = (invoices ?? []) as Invoice[];

  // Group by month
  const byMonth: Record<string, { count: number; total: number }> = {};
  paidInvoices.forEach((inv) => {
    const month = inv.payment_date?.slice(0, 7) ?? 'לא ידוע';
    if (!byMonth[month]) byMonth[month] = { count: 0, total: 0 };
    byMonth[month].count++;
    byMonth[month].total += Number(inv.amount);
  });
  const monthEntries = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));

  // Group by supplier
  const bySupplier: Record<string, { count: number; total: number }> = {};
  paidInvoices.forEach((inv) => {
    const key = inv.supplier_name;
    if (!bySupplier[key]) bySupplier[key] = { count: 0, total: 0 };
    bySupplier[key].count++;
    bySupplier[key].total += Number(inv.amount);
  });
  const supplierEntries = Object.entries(bySupplier).sort((a, b) => b[1].total - a[1].total);

  const grandTotal = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);

  function formatMonth(m: string) {
    if (m === 'לא ידוע') return m;
    const [y, mo] = m.split('-');
    const months = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    return `${months[parseInt(mo)]} ${y}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-2">דוחות</h1>
      <p className="text-sm text-muted mb-8">סיכום חשבוניות ששולמו — סה״כ {formatMoney(grandTotal)} ב-{paidInvoices.length} חשבוניות</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Month */}
        <div className="border border-line bg-white">
          <div className="p-4 border-b border-line font-medium text-sm">לפי חודש תשלום</div>
          {monthEntries.length === 0 ? (
            <div className="p-4 text-sm text-muted text-center">אין נתונים</div>
          ) : (
            <div className="divide-y divide-line">
              {monthEntries.map(([month, data]) => (
                <div key={month} className="p-3 flex justify-between items-center text-sm">
                  <span>{formatMonth(month)}</span>
                  <div className="text-left">
                    <span className="font-display font-bold">{formatMoney(data.total)}</span>
                    <span className="text-xs text-muted mr-2">({data.count})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Supplier */}
        <div className="border border-line bg-white">
          <div className="p-4 border-b border-line font-medium text-sm">לפי ספק</div>
          {supplierEntries.length === 0 ? (
            <div className="p-4 text-sm text-muted text-center">אין נתונים</div>
          ) : (
            <div className="divide-y divide-line">
              {supplierEntries.map(([supplier, data]) => (
                <div key={supplier} className="p-3 flex justify-between items-center text-sm">
                  <span>{supplier}</span>
                  <div className="text-left">
                    <span className="font-display font-bold">{formatMoney(data.total)}</span>
                    <span className="text-xs text-muted mr-2">({data.count})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
