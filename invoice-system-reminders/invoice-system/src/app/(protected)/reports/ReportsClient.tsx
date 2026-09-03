'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Invoice } from '@/lib/types';
import { formatDate, formatMoney } from '@/lib/utils';

interface Props {
  invoices: Invoice[];
}

export default function ReportsClient({ invoices }: Props) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  function formatMonth(m: string) {
    if (m === 'לא ידוע') return m;
    const [y, mo] = m.split('-');
    const months = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    return `${months[parseInt(mo)]} ${y}`;
  }

  // Group by month
  const byMonth = useMemo(() => {
    const map: Record<string, Invoice[]> = {};
    invoices.forEach((inv) => {
      const month = inv.payment_date?.slice(0, 7) ?? 'לא ידוע';
      if (!map[month]) map[month] = [];
      map[month].push(inv);
    });
    return Object.entries(map)
      .map(([month, items]) => ({
        month,
        label: formatMonth(month),
        items,
        total: items.reduce((s, i) => s + Number(i.amount), 0),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices]);

  // Group by supplier
  const bySupplier = useMemo(() => {
    const map: Record<string, Invoice[]> = {};
    invoices.forEach((inv) => {
      if (!map[inv.supplier_name]) map[inv.supplier_name] = [];
      map[inv.supplier_name].push(inv);
    });
    return Object.entries(map)
      .map(([supplier, items]) => ({
        supplier,
        items,
        total: items.reduce((s, i) => s + Number(i.amount), 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [invoices]);

  const grandTotal = invoices.reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl mb-2">דוחות</h1>
      <p className="text-sm text-muted mb-8">
        סיכום חשבוניות ששולמו — סה״כ {formatMoney(grandTotal)} ב-{invoices.length} חשבוניות.
        לחצי על שורה כדי לראות פירוט.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Month */}
        <div className="border border-line bg-white">
          <div className="p-4 border-b border-line font-medium text-sm">לפי חודש תשלום</div>
          {byMonth.length === 0 ? (
            <div className="p-4 text-sm text-muted text-center">אין נתונים</div>
          ) : (
            <div className="divide-y divide-line">
              {byMonth.map(({ month, label, items, total }) => (
                <div key={month}>
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === month ? null : month)}
                    className="w-full p-3 flex justify-between items-center text-sm hover:bg-paper transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted">{expandedMonth === month ? '▾' : '▸'}</span>
                      {label}
                    </span>
                    <div className="text-left">
                      <span className="font-display font-bold">{formatMoney(total)}</span>
                      <span className="text-xs text-muted mr-2">({items.length})</span>
                    </div>
                  </button>
                  {expandedMonth === month && (
                    <div className="bg-paper border-t border-line">
                      {items.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex justify-between items-center px-6 py-2 text-xs hover:bg-line/30 transition-colors border-b border-line/50 last:border-b-0"
                        >
                          <div>
                            <span className="font-medium text-sm">{inv.supplier_name}</span>
                            <span className="text-muted mr-2">מס׳ {inv.invoice_number}</span>
                          </div>
                          <div className="text-left">
                            <span className="font-display font-bold text-sm">{formatMoney(inv.amount)}</span>
                            <span className="text-muted mr-2">{formatDate(inv.payment_date)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Supplier */}
        <div className="border border-line bg-white">
          <div className="p-4 border-b border-line font-medium text-sm">לפי ספק</div>
          {bySupplier.length === 0 ? (
            <div className="p-4 text-sm text-muted text-center">אין נתונים</div>
          ) : (
            <div className="divide-y divide-line">
              {bySupplier.map(({ supplier, items, total }) => (
                <div key={supplier}>
                  <button
                    onClick={() => setExpandedSupplier(expandedSupplier === supplier ? null : supplier)}
                    className="w-full p-3 flex justify-between items-center text-sm hover:bg-paper transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted">{expandedSupplier === supplier ? '▾' : '▸'}</span>
                      {supplier}
                    </span>
                    <div className="text-left">
                      <span className="font-display font-bold">{formatMoney(total)}</span>
                      <span className="text-xs text-muted mr-2">({items.length})</span>
                    </div>
                  </button>
                  {expandedSupplier === supplier && (
                    <div className="bg-paper border-t border-line">
                      {items.map((inv) => (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex justify-between items-center px-6 py-2 text-xs hover:bg-line/30 transition-colors border-b border-line/50 last:border-b-0"
                        >
                          <div>
                            <span className="text-muted">מס׳ {inv.invoice_number}</span>
                            <span className="text-muted mr-2">{formatDate(inv.invoice_date)}</span>
                          </div>
                          <div className="text-left">
                            <span className="font-display font-bold text-sm">{formatMoney(inv.amount)}</span>
                            <span className="text-muted mr-2">{formatDate(inv.payment_date)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
