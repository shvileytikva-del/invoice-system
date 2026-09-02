'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { InvoiceWithComputed, UserRole } from '@/lib/types';
import { formatDate, formatMoney, paymentStatusLabel, receiptStatusLabel } from '@/lib/utils';

interface Props {
  invoices: InvoiceWithComputed[];
  uploaders: { id: string; name: string }[];
  userRole: UserRole;
}

type FilterStatus = 'all' | 'pending' | 'paid_no_receipt' | 'completed' | 'overdue';

export default function DashboardClient({ invoices, uploaders, userRole }: Props) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterUploader, setFilterUploader] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [searchText, setSearchText] = useState('');

  const stats = useMemo(() => {
    const pending = invoices.filter((i) => i.payment_status === 'pending' && !i.is_overdue);
    const overdue = invoices.filter((i) => i.is_overdue);
    const paidNoReceipt = invoices.filter((i) => i.payment_status === 'paid' && i.receipt_status === 'missing');
    const completed = invoices.filter((i) => i.is_completed);
    const pendingSum = [...pending, ...overdue].reduce((s, i) => s + Number(i.amount), 0);
    return {
      pendingCount: pending.length,
      overdueCount: overdue.length,
      paidNoReceiptCount: paidNoReceipt.length,
      completedCount: completed.length,
      pendingSum,
    };
  }, [invoices]);

  const suppliers = useMemo(() => {
    const set = new Set(invoices.map((i) => i.supplier_name));
    return Array.from(set).sort();
  }, [invoices]);

  const filtered = useMemo(() => {
    let result = invoices;

    if (filterStatus === 'pending') result = result.filter((i) => i.payment_status === 'pending' && !i.is_overdue);
    else if (filterStatus === 'overdue') result = result.filter((i) => i.is_overdue);
    else if (filterStatus === 'paid_no_receipt') result = result.filter((i) => i.payment_status === 'paid' && i.receipt_status === 'missing');
    else if (filterStatus === 'completed') result = result.filter((i) => i.is_completed);

    if (filterSupplier) result = result.filter((i) => i.supplier_name === filterSupplier);
    if (filterUploader) result = result.filter((i) => i.uploaded_by === filterUploader);
    if (filterMonth) result = result.filter((i) => i.invoice_date?.startsWith(filterMonth));

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.supplier_name.toLowerCase().includes(q) ||
          i.invoice_number.toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [invoices, filterStatus, filterSupplier, filterUploader, filterMonth, searchText]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-6">לוח בקרה</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatusCard
          label="ממתינות לתשלום"
          count={stats.pendingCount}
          tone="pending"
          active={filterStatus === 'pending'}
          onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
        />
        <StatusCard
          label="באיחור"
          count={stats.overdueCount}
          tone="overdue"
          active={filterStatus === 'overdue'}
          onClick={() => setFilterStatus(filterStatus === 'overdue' ? 'all' : 'overdue')}
        />
        <StatusCard
          label="שולמו — חסרה קבלה"
          count={stats.paidNoReceiptCount}
          tone="warning"
          active={filterStatus === 'paid_no_receipt'}
          onClick={() => setFilterStatus(filterStatus === 'paid_no_receipt' ? 'all' : 'paid_no_receipt')}
        />
        <StatusCard
          label="הושלמו"
          count={stats.completedCount}
          tone="paid"
          active={filterStatus === 'completed'}
          onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
        />
        <StatusCard label="סה״כ ממתין" count={formatMoney(stats.pendingSum)} tone="neutral" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">חיפוש</label>
          <input
            type="text"
            placeholder="ספק, מספר חשבונית..."
            className="border border-line px-3 py-1.5 text-sm bg-white w-48"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">ספק</label>
          <select
            className="border border-line px-3 py-1.5 text-sm bg-white"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">הכל</option>
            {suppliers.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">הועלה ע״י</label>
          <select
            className="border border-line px-3 py-1.5 text-sm bg-white"
            value={filterUploader}
            onChange={(e) => setFilterUploader(e.target.value)}
          >
            <option value="">הכל</option>
            {uploaders.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">חודש</label>
          <input
            type="month"
            className="border border-line px-3 py-1.5 text-sm bg-white"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>
        {(filterStatus !== 'all' || filterSupplier || filterUploader || filterMonth || searchText) && (
          <button
            className="text-xs text-muted underline underline-offset-2 pb-2"
            onClick={() => {
              setFilterStatus('all');
              setFilterSupplier('');
              setFilterUploader('');
              setFilterMonth('');
              setSearchText('');
            }}
          >
            נקה סינון
          </button>
        )}
      </div>

      {/* Invoice Table */}
      <div className="text-xs text-muted mb-2">{filtered.length} חשבוניות</div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-line bg-white text-center text-sm text-muted py-12">
          לא נמצאו חשבוניות בסינון הנוכחי.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="border border-line bg-white hover:border-ink transition-colors block"
            >
              <div className="flex items-center gap-3 p-3 flex-wrap">
                <div className="flex gap-2 flex-wrap min-w-[120px]">
                  <StatusBadge
                    label={inv.is_overdue ? 'באיחור' : paymentStatusLabel(inv.payment_status)}
                    tone={inv.is_overdue ? 'overdue' : inv.payment_status === 'paid' ? 'paid' : 'pending'}
                  />
                  {inv.payment_status === 'paid' && (
                    <StatusBadge
                      label={inv.receipt_status === 'received' ? 'קבלה ✓' : 'חסרה קבלה'}
                      tone={inv.receipt_status === 'received' ? 'paid' : 'warning'}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-[140px]">
                  <div className="font-medium text-sm">{inv.supplier_name}</div>
                  <div className="text-xs text-muted">מס׳ {inv.invoice_number}</div>
                </div>
                <div className="text-xs text-muted min-w-[85px]">יעד: {formatDate(inv.due_date)}</div>
                <div className="text-xs text-muted min-w-[85px]">{inv.uploader_name}</div>
                <div className="font-display font-bold text-sm min-w-[80px] text-left">{formatMoney(inv.amount)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusCard({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string;
  count: number | string;
  tone: 'pending' | 'overdue' | 'warning' | 'paid' | 'neutral';
  active?: boolean;
  onClick?: () => void;
}) {
  const bgMap = {
    pending: 'bg-pendingBg',
    overdue: 'bg-overdueBg',
    warning: 'bg-orange-50',
    paid: 'bg-paidBg',
    neutral: 'bg-white',
  };
  const numColorMap = {
    pending: 'text-pending',
    overdue: 'text-overdue',
    warning: 'text-orange-600',
    paid: 'text-paid',
    neutral: 'text-ink',
  };

  return (
    <button
      onClick={onClick}
      className={`border p-3 text-center transition-all ${
        active ? 'border-ink ring-1 ring-ink' : 'border-line'
      } ${bgMap[tone]} ${onClick ? 'cursor-pointer hover:border-ink' : 'cursor-default'}`}
    >
      <div className={`font-display font-bold text-xl ${numColorMap[tone]}`}>{count}</div>
      <div className="text-xs text-muted mt-1 leading-tight">{label}</div>
    </button>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'pending' | 'paid' | 'overdue' | 'warning' }) {
  const classes = {
    pending: 'bg-pendingBg text-pending',
    paid: 'bg-paidBg text-paid',
    overdue: 'bg-overdueBg text-overdue',
    warning: 'bg-orange-50 text-orange-600',
  }[tone];
  return <span className={`text-xs font-semibold px-2 py-0.5 whitespace-nowrap ${classes}`}>{label}</span>;
}
