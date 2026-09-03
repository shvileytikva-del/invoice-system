'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

// ============================================================
// נתוני דמו ריאליסטיים
// ============================================================
const DEMO_INVOICES = [
  {
    id: '1', supplier_name: 'הוצאת אור הדעת', supplier_email: 'orders@ordaat.co.il',
    invoice_number: 'INV-4521', invoice_date: '2026-08-10', amount: 8400,
    description: 'ספרי לימוד מגמת מדעים — כיתות י׳', due_date: '2026-09-10',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-08-12T09:15:00Z',
    payment_status: 'pending', payment_date: null, payment_method: null,
    payment_reference: null, receipt_status: 'missing', notes: 'הזמנה 1180 — 60 עותקים',
  },
  {
    id: '2', supplier_name: 'שירותי הסעות נתיבי ארץ', supplier_email: '',
    invoice_number: '88410', invoice_date: '2026-07-15', amount: 12600,
    description: 'הסעות טיול שנתי — כיתות י״א', due_date: '2026-08-15',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-07-18T14:30:00Z',
    payment_status: 'pending', payment_date: null, payment_method: null,
    payment_reference: null, receipt_status: 'missing', notes: 'דחוף!! עבר מועד התשלום',
  },
  {
    id: '3', supplier_name: 'קייטרינג טעם ואווירה', supplier_email: 'info@taam-avira.co.il',
    invoice_number: 'TA-772', invoice_date: '2026-07-28', amount: 5200,
    description: 'כיבוד ערב הורים — סמסטר א׳', due_date: '2026-08-25',
    uploaded_by: 'מיכל לוי', uploaded_at: '2026-07-30T10:45:00Z',
    payment_status: 'pending', payment_date: null, payment_method: null,
    payment_reference: null, receipt_status: 'missing', notes: null,
  },
  {
    id: '4', supplier_name: 'דפוס ירושלים', supplier_email: 'print@dfusj.co.il',
    invoice_number: 'DJ-3391', invoice_date: '2026-08-01', amount: 2800,
    description: 'הדפסת חוברות פתיחת שנה — 400 עותקים', due_date: '2026-08-30',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-08-03T08:20:00Z',
    payment_status: 'paid', payment_date: '2026-08-22', payment_method: 'העברה בנקאית',
    payment_reference: '55-449801', receipt_status: 'missing', notes: null,
  },
  {
    id: '5', supplier_name: 'חברת החשמל', supplier_email: '',
    invoice_number: 'E-2026-08', invoice_date: '2026-08-05', amount: 7300,
    description: 'חשבון חשמל — אוגוסט', due_date: '2026-09-05',
    uploaded_by: 'מיכל לוי', uploaded_at: '2026-08-07T11:00:00Z',
    payment_status: 'paid', payment_date: '2026-08-28', payment_method: 'הוראת קבע',
    payment_reference: 'הק-114420', receipt_status: 'missing', notes: null,
  },
  {
    id: '6', supplier_name: 'משרד ספקים מרכזי', supplier_email: 'sales@misrad-s.co.il',
    invoice_number: 'MSM-7720', invoice_date: '2026-06-15', amount: 3100,
    description: 'ציוד משרדי — ניירת, טונרים, כלי כתיבה', due_date: '2026-07-15',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-06-18T09:30:00Z',
    payment_status: 'paid', payment_date: '2026-07-10', payment_method: 'צ׳ק',
    payment_reference: '30045', receipt_status: 'received', notes: 'קבלה מס׳ 9921',
  },
  {
    id: '7', supplier_name: 'הוצאת אור הדעת', supplier_email: 'orders@ordaat.co.il',
    invoice_number: 'INV-3988', invoice_date: '2026-05-10', amount: 6200,
    description: 'ספרי לימוד מגמת אנגלית — כיתות ט׳', due_date: '2026-06-10',
    uploaded_by: 'מיכל לוי', uploaded_at: '2026-05-12T13:00:00Z',
    payment_status: 'paid', payment_date: '2026-06-08', payment_method: 'העברה בנקאית',
    payment_reference: '44-332210', receipt_status: 'received', notes: null,
  },
  {
    id: '8', supplier_name: 'מחשבים ותקשורת בע"מ', supplier_email: 'support@machshevim.co.il',
    invoice_number: 'IT-2026-04', invoice_date: '2026-04-20', amount: 14500,
    description: 'תחזוקת מחשבים שנתית + החלפת 3 מסכים', due_date: '2026-05-20',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-04-22T08:00:00Z',
    payment_status: 'paid', payment_date: '2026-05-18', payment_method: 'אשראי',
    payment_reference: 'כ.א 9988-44', receipt_status: 'received', notes: null,
  },
  {
    id: '9', supplier_name: 'ביטוח מגדל', supplier_email: '',
    invoice_number: 'INS-2026', invoice_date: '2026-09-01', amount: 18000,
    description: 'ביטוח מבנה בית ספר — שנתי', due_date: '2026-10-01',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-09-01T07:30:00Z',
    payment_status: 'pending', payment_date: null, payment_method: null,
    payment_reference: null, receipt_status: 'missing', notes: 'אפשר לפצל ל-3 תשלומים',
  },
  {
    id: '10', supplier_name: 'קייטרינג טעם ואווירה', supplier_email: 'info@taam-avira.co.il',
    invoice_number: 'TA-810', invoice_date: '2026-09-01', amount: 4800,
    description: 'כיבוד טקס פתיחת שנת הלימודים', due_date: '2026-09-20',
    uploaded_by: 'מיכל לוי', uploaded_at: '2026-09-01T10:00:00Z',
    payment_status: 'pending', payment_date: null, payment_method: null,
    payment_reference: null, receipt_status: 'missing', notes: 'תפריט צמחוני — 120 מנות',
  },
  {
    id: '11', supplier_name: 'גלריית אמנות חינוכית', supplier_email: '',
    invoice_number: 'GAC-156', invoice_date: '2026-06-20', amount: 1950,
    description: 'ציוד למגמת אמנות — בדים, צבעים, מכחולים', due_date: '2026-07-20',
    uploaded_by: 'מיכל לוי', uploaded_at: '2026-06-22T14:15:00Z',
    payment_status: 'paid', payment_date: '2026-07-18', payment_method: 'צ׳ק',
    payment_reference: '30098', receipt_status: 'received', notes: null,
  },
  {
    id: '12', supplier_name: 'שירותי ניקיון אור', supplier_email: '',
    invoice_number: 'ON-2026-08', invoice_date: '2026-08-01', amount: 9200,
    description: 'ניקיון חודשי — אוגוסט', due_date: '2026-08-31',
    uploaded_by: 'רחל כהן', uploaded_at: '2026-08-02T07:00:00Z',
    payment_status: 'paid', payment_date: '2026-08-29', payment_method: 'העברה בנקאית',
    payment_reference: '55-449920', receipt_status: 'received', notes: 'כולל ניקיון כללי לפני פתיחת שנה',
  },
];

type DemoInvoice = typeof DEMO_INVOICES[number];
type FilterStatus = 'all' | 'pending' | 'paid_no_receipt' | 'completed' | 'overdue';

function computeFlags(inv: DemoInvoice) {
  const today = new Date().toISOString().slice(0, 10);
  const is_completed = inv.payment_status === 'paid' && inv.receipt_status === 'received';
  const is_overdue = inv.payment_status === 'pending' && !!inv.due_date && inv.due_date < today;
  return { is_overdue, is_completed };
}

function fmtMoney(n: number) { return '₪' + n.toLocaleString('he-IL'); }
function fmtDate(d: string | null) {
  if (!d) return '—';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// Main Demo Component
// ============================================================
export default function DemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchText, setSearchText] = useState('');

  const invoices = DEMO_INVOICES;

  const stats = useMemo(() => {
    const pending = invoices.filter(i => i.payment_status === 'pending' && !computeFlags(i).is_overdue);
    const overdue = invoices.filter(i => computeFlags(i).is_overdue);
    const paidNoReceipt = invoices.filter(i => i.payment_status === 'paid' && i.receipt_status === 'missing');
    const completed = invoices.filter(i => computeFlags(i).is_completed);
    const pendingSum = [...pending, ...overdue].reduce((s, i) => s + i.amount, 0);
    return { pendingCount: pending.length, overdueCount: overdue.length, paidNoReceiptCount: paidNoReceipt.length, completedCount: completed.length, pendingSum };
  }, [invoices]);

  const filtered = useMemo(() => {
    let result = invoices;
    if (filterStatus === 'pending') result = result.filter(i => i.payment_status === 'pending' && !computeFlags(i).is_overdue);
    else if (filterStatus === 'overdue') result = result.filter(i => computeFlags(i).is_overdue);
    else if (filterStatus === 'paid_no_receipt') result = result.filter(i => i.payment_status === 'paid' && i.receipt_status === 'missing');
    else if (filterStatus === 'completed') result = result.filter(i => computeFlags(i).is_completed);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(i => i.supplier_name.toLowerCase().includes(q) || i.invoice_number.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q));
    }
    return result;
  }, [invoices, filterStatus, searchText]);

  const selected = selectedId ? invoices.find(i => i.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-brandPinkPale">
      {/* Top Bar */}
      <div className="bg-brand text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="שבילי תקווה" width={36} height={36} className="rounded-full" />
            <span className="font-display font-bold text-lg">מעקב חשבוניות</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-sm mr-2">דמו</span>
          </div>
          <div className="text-xs text-white/70">
            תיכון שבילי תקווה — בית יעקב בית שאן
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-brand/5 border-b border-line">
        <div className="max-w-5xl mx-auto px-5 py-6 text-center">
          <h1 className="font-display font-bold text-2xl text-brand mb-2">מערכת מעקב חשבוניות ותשלומים</h1>
          <p className="text-sm text-muted max-w-lg mx-auto">
            כל החשבוניות במקום אחד. סטטוס ברור, תזכורות לאיחור, קבלות מקושרות.
            <br />המזכיר יודע בכל רגע מה שולם ומה לא — בלי לחפש במייל.
          </p>
          <p className="text-xs text-brand/50 mt-3">↓ גללו למטה לראות את המערכת בפעולה ↓</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-xl mb-6 text-brand">לוח בקרה</h2>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatusCard label="ממתינות לתשלום" count={stats.pendingCount} tone="pending" active={filterStatus === 'pending'} onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')} />
          <StatusCard label="באיחור" count={stats.overdueCount} tone="overdue" active={filterStatus === 'overdue'} onClick={() => setFilterStatus(filterStatus === 'overdue' ? 'all' : 'overdue')} />
          <StatusCard label="שולמו — חסרה קבלה" count={stats.paidNoReceiptCount} tone="warning" active={filterStatus === 'paid_no_receipt'} onClick={() => setFilterStatus(filterStatus === 'paid_no_receipt' ? 'all' : 'paid_no_receipt')} />
          <StatusCard label="הושלמו" count={stats.completedCount} tone="paid" active={filterStatus === 'completed'} onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')} />
          <StatusCard label="סה״כ ממתין" count={fmtMoney(stats.pendingSum)} tone="neutral" />
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">חיפוש</label>
            <input type="text" placeholder="ספק, מספר חשבונית..." className="border border-line px-3 py-1.5 text-sm bg-white w-56" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>
          {(filterStatus !== 'all' || searchText) && (
            <button className="text-xs text-muted underline pb-2" onClick={() => { setFilterStatus('all'); setSearchText(''); }}>נקה סינון</button>
          )}
        </div>

        <div className="text-xs text-muted mb-2">{filtered.length} חשבוניות</div>

        {/* Invoice List */}
        <div className="flex flex-col gap-2">
          {filtered.map((inv) => {
            const { is_overdue, is_completed } = computeFlags(inv);
            return (
              <button key={inv.id} onClick={() => setSelectedId(inv.id)} className="border border-line bg-white hover:border-brand/40 transition-colors block w-full text-right">
                <div className="flex items-center gap-3 p-3 flex-wrap">
                  <div className="flex gap-2 flex-wrap min-w-[120px]">
                    <Badge label={is_overdue ? 'באיחור' : inv.payment_status === 'paid' ? 'שולם' : 'ממתינה לתשלום'} tone={is_overdue ? 'overdue' : inv.payment_status === 'paid' ? 'paid' : 'pending'} />
                    {inv.payment_status === 'paid' && (
                      <Badge label={inv.receipt_status === 'received' ? 'קבלה ✓' : 'חסרה קבלה'} tone={inv.receipt_status === 'received' ? 'paid' : 'warning'} />
                    )}
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="font-medium text-sm">{inv.supplier_name}</div>
                    <div className="text-xs text-muted">מס׳ {inv.invoice_number}</div>
                  </div>
                  <div className="text-xs text-muted min-w-[85px]">{inv.due_date ? `יעד: ${fmtDate(inv.due_date)}` : ''}</div>
                  <div className="text-xs text-muted min-w-[70px]">{inv.uploaded_by}</div>
                  <div className="font-display font-bold text-sm min-w-[80px] text-left">{fmtMoney(inv.amount)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
          <div className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto border border-line shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-line flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-brand">{selected.supplier_name}</h2>
                <div className="text-sm text-muted">חשבונית מס׳ {selected.invoice_number}</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-display font-bold text-xl">{fmtMoney(selected.amount)}</div>
                <button onClick={() => setSelectedId(null)} className="text-muted hover:text-brand text-lg leading-none">✕</button>
              </div>
            </div>

            <div className="p-5 border-b border-line flex gap-2 flex-wrap">
              {(() => { const { is_overdue, is_completed } = computeFlags(selected); return (<>
                <Badge label={is_overdue ? 'באיחור' : selected.payment_status === 'paid' ? 'שולם' : 'ממתינה לתשלום'} tone={is_overdue ? 'overdue' : selected.payment_status === 'paid' ? 'paid' : 'pending'} />
                {selected.payment_status === 'paid' && <Badge label={selected.receipt_status === 'received' ? 'קבלה התקבלה' : 'חסרה קבלה'} tone={selected.receipt_status === 'received' ? 'paid' : 'warning'} />}
                {is_completed && <Badge label="הושלמה" tone="paid" />}
              </>); })()}
            </div>

            <div className="p-5 border-b border-line grid grid-cols-2 gap-3 text-sm">
              <Detail label="תאריך חשבונית" value={fmtDate(selected.invoice_date)} />
              <Detail label="תאריך אחרון לתשלום" value={selected.due_date ? fmtDate(selected.due_date) : 'לא צוין'} />
              <Detail label="עבור מה" value={selected.description || '—'} />
              <Detail label="הועלה ע״י" value={selected.uploaded_by} />
              <Detail label="תאריך העלאה" value={fmtDateTime(selected.uploaded_at)} />
              {selected.supplier_email && <Detail label="מייל ספק" value={selected.supplier_email} />}
              {selected.notes && <div className="col-span-2"><Detail label="הערות" value={selected.notes} /></div>}
            </div>

            <div className="p-5 border-b border-line">
              <div className="text-xs text-muted mb-1">קובץ חשבונית</div>
              <span className="text-sm text-brand underline underline-offset-2 cursor-pointer">צפייה / הורדה (דמו)</span>
            </div>

            {selected.payment_status === 'paid' && (
              <>
                <div className="p-5 border-b border-line">
                  <div className="text-xs text-muted mb-3">פרטי תשלום</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Detail label="תאריך תשלום" value={fmtDate(selected.payment_date)} />
                    <Detail label="אמצעי תשלום" value={selected.payment_method || '—'} />
                    <Detail label="מספר אסמכתא" value={selected.payment_reference || '—'} />
                  </div>
                </div>
                <div className="p-5 border-b border-line">
                  <div className="text-xs text-muted mb-1">קבלה</div>
                  {selected.receipt_status === 'received' ? (
                    <span className="text-sm text-brand underline underline-offset-2 cursor-pointer">צפייה / הורדה בקבלה (דמו)</span>
                  ) : (
                    <div className="text-sm">
                      <button className="bg-brand text-white text-sm font-medium px-4 py-2 hover:opacity-90 cursor-pointer rounded-sm">העלאת קבלה</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {selected.payment_status === 'pending' && (
              <div className="p-5">
                <button className="bg-brand text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 cursor-pointer rounded-sm">סמן כשולם</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-brand text-white py-10 mt-12">
        <div className="max-w-lg mx-auto text-center px-4">
          <h2 className="font-display font-bold text-xl mb-3">מעוניינים במערכת דומה עבור הארגון שלכם?</h2>
          <p className="text-sm text-white/70 mb-5">
            המערכת מותאמת אישית לצרכים של מוסדות חינוך, עמותות וארגונים.
            <br />כולל: הרשאות, העלאת קבצים, מעקב תשלומים, דוחות, והתראות מייל.
          </p>
          <a
            href="https://wa.me/972533139917?text=שלום, ראיתי את מערכת מעקב החשבוניות ואשמח לשמוע פרטים"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-brand font-bold text-sm px-8 py-3 hover:bg-brandPinkLight transition-colors rounded-sm"
          >
            צרו קשר בוואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================
function StatusCard({ label, count, tone, active, onClick }: { label: string; count: number | string; tone: string; active?: boolean; onClick?: () => void }) {
  const bgMap: Record<string, string> = { pending: 'bg-pendingBg', overdue: 'bg-overdueBg', warning: 'bg-orange-50', paid: 'bg-paidBg', neutral: 'bg-white' };
  const numMap: Record<string, string> = { pending: 'text-pending', overdue: 'text-overdue', warning: 'text-orange-600', paid: 'text-paid', neutral: 'text-brand' };
  return (
    <button onClick={onClick} className={`border p-3 text-center transition-all ${active ? 'border-brand ring-1 ring-brand' : 'border-line'} ${bgMap[tone] || 'bg-white'} ${onClick ? 'cursor-pointer hover:border-brand' : 'cursor-default'}`}>
      <div className={`font-display font-bold text-xl ${numMap[tone] || 'text-brand'}`}>{count}</div>
      <div className="text-xs text-muted mt-1 leading-tight">{label}</div>
    </button>
  );
}

function Badge({ label, tone }: { label: string; tone: string }) {
  const cls: Record<string, string> = { pending: 'bg-pendingBg text-pending', paid: 'bg-paidBg text-paid', overdue: 'bg-overdueBg text-overdue', warning: 'bg-orange-50 text-orange-600' };
  return <span className={`text-xs font-semibold px-2 py-0.5 whitespace-nowrap ${cls[tone] || cls.pending}`}>{label}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}
