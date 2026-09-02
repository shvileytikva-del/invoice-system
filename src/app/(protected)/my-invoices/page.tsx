import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { computeInvoiceFlags, type Invoice } from '@/lib/types';
import { formatDate, formatMoney, paymentStatusLabel, receiptStatusLabel } from '@/lib/utils';

export default async function MyInvoicesPage() {
  const user = await requireUser();
  const supabase = createServerSupabaseClient();

  // בזכות ה-RLS, השאילתה הזו מחזירה אוטומטית רק את החשבוניות שהמשתמש/ת העלה
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('uploaded_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl">החשבוניות שלי</h1>
        <Link
          href="/invoices/new"
          className="bg-ink text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          + חשבונית חדשה
        </Link>
      </div>

      {error && <p className="text-overdue text-sm">שגיאה בטעינת החשבוניות.</p>}

      {!error && (!invoices || invoices.length === 0) && (
        <div className="border border-dashed border-line text-center text-sm text-muted py-16">
          עדיין לא העלית חשבוניות. לחצי על "חשבונית חדשה" כדי להתחיל.
        </div>
      )}

      {invoices && invoices.length > 0 && (
        <div className="flex flex-col gap-2">
          {(invoices as Invoice[]).map((inv) => {
            const { is_overdue, is_completed } = computeInvoiceFlags(inv);
            return (
              <div key={inv.id} className="border border-line bg-white p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <div className="font-medium text-sm">{inv.supplier_name}</div>
                  <div className="text-xs text-muted">חשבונית מס' {inv.invoice_number}</div>
                </div>
                <div className="text-xs text-muted min-w-[90px]">יעד: {formatDate(inv.due_date)}</div>
                <div className="font-display font-bold text-sm min-w-[80px]">{formatMoney(inv.amount)}</div>
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge
                    label={is_overdue ? 'באיחור' : paymentStatusLabel(inv.payment_status)}
                    tone={is_overdue ? 'overdue' : inv.payment_status === 'paid' ? 'paid' : 'pending'}
                  />
                  {inv.payment_status === 'paid' && (
                    <StatusBadge
                      label={receiptStatusLabel(inv.receipt_status)}
                      tone={inv.receipt_status === 'received' ? 'paid' : 'pending'}
                    />
                  )}
                  {is_completed && <StatusBadge label="הושלמה" tone="paid" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'pending' | 'paid' | 'overdue' }) {
  const classes = {
    pending: 'bg-pendingBg text-pending',
    paid: 'bg-paidBg text-paid',
    overdue: 'bg-overdueBg text-overdue',
  }[tone];

  return <span className={`text-xs font-semibold px-2.5 py-1 ${classes}`}>{label}</span>;
}
