'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

// ============================================================
// Demo Data
// ============================================================
const DEMO_INVOICES = [
  { id:'1', supplier_name:'הוצאת אור הדעת', supplier_email:'orders@ordaat.co.il', invoice_number:'INV-4521', invoice_date:'2026-08-10', amount:8400, description:'ספרי לימוד מגמת מדעים — כיתות י׳', due_date:'2026-09-10', uploaded_by:'רחל כהן', uploaded_at:'2026-08-12T09:15:00Z', payment_status:'pending', payment_date:null, payment_method:null, payment_reference:null, receipt_status:'missing', notes:'הזמנה 1180 — 60 עותקים' },
  { id:'2', supplier_name:'שירותי הסעות נתיבי ארץ', supplier_email:'', invoice_number:'88410', invoice_date:'2026-07-15', amount:12600, description:'הסעות טיול שנתי — כיתות י״א', due_date:'2026-08-15', uploaded_by:'רחל כהן', uploaded_at:'2026-07-18T14:30:00Z', payment_status:'pending', payment_date:null, payment_method:null, payment_reference:null, receipt_status:'missing', notes:'דחוף!! עבר מועד התשלום' },
  { id:'3', supplier_name:'קייטרינג טעם ואווירה', supplier_email:'info@taam-avira.co.il', invoice_number:'TA-772', invoice_date:'2026-07-28', amount:5200, description:'כיבוד ערב הורים — סמסטר א׳', due_date:'2026-08-25', uploaded_by:'מיכל לוי', uploaded_at:'2026-07-30T10:45:00Z', payment_status:'pending', payment_date:null, payment_method:null, payment_reference:null, receipt_status:'missing', notes:null },
  { id:'4', supplier_name:'דפוס ירושלים', supplier_email:'print@dfusj.co.il', invoice_number:'DJ-3391', invoice_date:'2026-08-01', amount:2800, description:'הדפסת חוברות פתיחת שנה — 400 עותקים', due_date:'2026-08-30', uploaded_by:'רחל כהן', uploaded_at:'2026-08-03T08:20:00Z', payment_status:'paid', payment_date:'2026-08-22', payment_method:'העברה בנקאית', payment_reference:'55-449801', receipt_status:'missing', notes:null },
  { id:'5', supplier_name:'חברת החשמל', supplier_email:'', invoice_number:'E-2026-08', invoice_date:'2026-08-05', amount:7300, description:'חשבון חשמל — אוגוסט', due_date:'2026-09-05', uploaded_by:'מיכל לוי', uploaded_at:'2026-08-07T11:00:00Z', payment_status:'paid', payment_date:'2026-08-28', payment_method:'הוראת קבע', payment_reference:'הק-114420', receipt_status:'missing', notes:null },
  { id:'6', supplier_name:'משרד ספקים מרכזי', supplier_email:'sales@misrad-s.co.il', invoice_number:'MSM-7720', invoice_date:'2026-06-15', amount:3100, description:'ציוד משרדי — ניירת, טונרים, כלי כתיבה', due_date:'2026-07-15', uploaded_by:'רחל כהן', uploaded_at:'2026-06-18T09:30:00Z', payment_status:'paid', payment_date:'2026-07-10', payment_method:'צ׳ק', payment_reference:'30045', receipt_status:'received', notes:'קבלה מס׳ 9921' },
  { id:'7', supplier_name:'הוצאת אור הדעת', supplier_email:'orders@ordaat.co.il', invoice_number:'INV-3988', invoice_date:'2026-05-10', amount:6200, description:'ספרי לימוד מגמת אנגלית — כיתות ט׳', due_date:'2026-06-10', uploaded_by:'מיכל לוי', uploaded_at:'2026-05-12T13:00:00Z', payment_status:'paid', payment_date:'2026-06-08', payment_method:'העברה בנקאית', payment_reference:'44-332210', receipt_status:'received', notes:null },
  { id:'8', supplier_name:'מחשבים ותקשורת בע"מ', supplier_email:'support@machshevim.co.il', invoice_number:'IT-2026-04', invoice_date:'2026-04-20', amount:14500, description:'תחזוקת מחשבים שנתית + החלפת 3 מסכים', due_date:'2026-05-20', uploaded_by:'רחל כהן', uploaded_at:'2026-04-22T08:00:00Z', payment_status:'paid', payment_date:'2026-05-18', payment_method:'אשראי', payment_reference:'כ.א 9988-44', receipt_status:'received', notes:null },
  { id:'9', supplier_name:'ביטוח מגדל', supplier_email:'', invoice_number:'INS-2026', invoice_date:'2026-09-01', amount:18000, description:'ביטוח מבנה בית ספר — שנתי', due_date:'2026-10-01', uploaded_by:'רחל כהן', uploaded_at:'2026-09-01T07:30:00Z', payment_status:'pending', payment_date:null, payment_method:null, payment_reference:null, receipt_status:'missing', notes:'אפשר לפצל ל-3 תשלומים' },
  { id:'10', supplier_name:'קייטרינג טעם ואווירה', supplier_email:'info@taam-avira.co.il', invoice_number:'TA-810', invoice_date:'2026-09-01', amount:4800, description:'כיבוד טקס פתיחת שנת הלימודים', due_date:'2026-09-20', uploaded_by:'מיכל לוי', uploaded_at:'2026-09-01T10:00:00Z', payment_status:'pending', payment_date:null, payment_method:null, payment_reference:null, receipt_status:'missing', notes:'תפריט צמחוני — 120 מנות' },
  { id:'11', supplier_name:'גלריית אמנות חינוכית', supplier_email:'', invoice_number:'GAC-156', invoice_date:'2026-06-20', amount:1950, description:'ציוד למגמת אמנות — בדים, צבעים, מכחולים', due_date:'2026-07-20', uploaded_by:'מיכל לוי', uploaded_at:'2026-06-22T14:15:00Z', payment_status:'paid', payment_date:'2026-07-18', payment_method:'צ׳ק', payment_reference:'30098', receipt_status:'received', notes:null },
  { id:'12', supplier_name:'שירותי ניקיון אור', supplier_email:'', invoice_number:'ON-2026-08', invoice_date:'2026-08-01', amount:9200, description:'ניקיון חודשי — אוגוסט', due_date:'2026-08-31', uploaded_by:'רחל כהן', uploaded_at:'2026-08-02T07:00:00Z', payment_status:'paid', payment_date:'2026-08-29', payment_method:'העברה בנקאית', payment_reference:'55-449920', receipt_status:'received', notes:'כולל ניקיון כללי לפני פתיחת שנה' },
];

type DemoInvoice = typeof DEMO_INVOICES[number];
type FilterStatus = 'all' | 'pending' | 'paid_no_receipt' | 'completed' | 'overdue';
type DemoView = 'dashboard' | 'new-invoice' | 'reports';

function computeFlags(inv: DemoInvoice) {
  const today = new Date().toISOString().slice(0, 10);
  return { is_completed: inv.payment_status === 'paid' && inv.receipt_status === 'received', is_overdue: inv.payment_status === 'pending' && !!inv.due_date && inv.due_date < today };
}
function fmtMoney(n: number) { return '₪' + n.toLocaleString('he-IL'); }
function fmtDate(d: string | null) { if (!d) return '—'; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; }
function fmtDateTime(iso: string) { const d = new Date(iso); return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); }
function fmtMonth(m: string) { const [y, mo] = m.split('-'); const months = ['','ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']; return `${months[parseInt(mo)]} ${y}`; }

export default function DemoPage() {
  const [view, setView] = useState<DemoView>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchText, setSearchText] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [showReceiptDone, setShowReceiptDone] = useState(false);
  const [showNewSuccess, setShowNewSuccess] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

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
    if (searchText.trim()) { const q = searchText.trim().toLowerCase(); result = result.filter(i => i.supplier_name.toLowerCase().includes(q) || i.invoice_number.toLowerCase().includes(q)); }
    return result;
  }, [invoices, filterStatus, searchText]);

  const paidInvoices = invoices.filter(i => i.payment_status === 'paid');
  const byMonth = useMemo(() => {
    const map: Record<string, DemoInvoice[]> = {};
    paidInvoices.forEach(inv => { const m = inv.payment_date?.slice(0, 7) ?? '?'; if (!map[m]) map[m] = []; map[m].push(inv); });
    return Object.entries(map).map(([m, items]) => ({ month: m, label: fmtMonth(m), items, total: items.reduce((s, i) => s + i.amount, 0) })).sort((a, b) => b.month.localeCompare(a.month));
  }, [paidInvoices]);
  const bySupplier = useMemo(() => {
    const map: Record<string, DemoInvoice[]> = {};
    paidInvoices.forEach(inv => { if (!map[inv.supplier_name]) map[inv.supplier_name] = []; map[inv.supplier_name].push(inv); });
    return Object.entries(map).map(([s, items]) => ({ supplier: s, items, total: items.reduce((s2, i) => s2 + i.amount, 0) })).sort((a, b) => b.total - a.total);
  }, [paidInvoices]);
  const grandTotal = paidInvoices.reduce((s, i) => s + i.amount, 0);

  const selected = selectedId ? invoices.find(i => i.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-brandPinkPale" dir="rtl">
      {/* Nav */}
      <div className="bg-brand text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="שבילי תקווה" width={36} height={36} className="rounded-full" />
            <span className="font-display font-bold text-lg">מעקב חשבוניות</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm mr-1">דמו</span>
          </div>
          <nav className="flex gap-4 flex-wrap text-sm">
            <button onClick={() => { setView('dashboard'); setSelectedId(null); }} className={`${view === 'dashboard' ? 'text-white' : 'text-white/60'} hover:text-white`}>לוח בקרה</button>
            <button onClick={() => { setView('new-invoice'); setShowNewSuccess(false); }} className={`${view === 'new-invoice' ? 'text-white' : 'text-white/60'} hover:text-white`}>חשבונית חדשה</button>
            <button onClick={() => setView('reports')} className={`${view === 'reports' ? 'text-white' : 'text-white/60'} hover:text-white`}>דוחות</button>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-brand/5 border-b border-line">
        <div className="max-w-5xl mx-auto px-5 py-5 text-center">
          <h1 className="font-display font-bold text-2xl text-brand mb-1">מערכת מעקב חשבוניות ותשלומים</h1>
          <p className="text-sm text-muted">כל החשבוניות במקום אחד. סטטוס ברור. קבלות מקושרות. המזכיר יודע בכל רגע מה שולם ומה לא.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ===== DASHBOARD VIEW ===== */}
        {view === 'dashboard' && !selected && (<>
          <h2 className="font-display font-bold text-xl mb-6 text-brand">לוח בקרה</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            <StatCard label="ממתינות לתשלום" count={stats.pendingCount} tone="pending" active={filterStatus==='pending'} onClick={() => setFilterStatus(filterStatus==='pending'?'all':'pending')} />
            <StatCard label="באיחור" count={stats.overdueCount} tone="overdue" active={filterStatus==='overdue'} onClick={() => setFilterStatus(filterStatus==='overdue'?'all':'overdue')} />
            <StatCard label="שולמו — חסרה קבלה" count={stats.paidNoReceiptCount} tone="warning" active={filterStatus==='paid_no_receipt'} onClick={() => setFilterStatus(filterStatus==='paid_no_receipt'?'all':'paid_no_receipt')} />
            <StatCard label="הושלמו" count={stats.completedCount} tone="paid" active={filterStatus==='completed'} onClick={() => setFilterStatus(filterStatus==='completed'?'all':'completed')} />
            <StatCard label="סה״כ ממתין" count={fmtMoney(stats.pendingSum)} tone="neutral" />
          </div>
          <div className="flex gap-3 mb-4 items-end flex-wrap">
            <div className="flex flex-col gap-1"><label className="text-xs text-muted">חיפוש</label><input type="text" placeholder="ספק, מספר חשבונית..." className="border border-line px-3 py-1.5 text-sm bg-white w-56" value={searchText} onChange={e => setSearchText(e.target.value)} /></div>
            {(filterStatus !== 'all' || searchText) && <button className="text-xs text-muted underline pb-2" onClick={() => { setFilterStatus('all'); setSearchText(''); }}>נקה סינון</button>}
          </div>
          <div className="text-xs text-muted mb-2">{filtered.length} חשבוניות</div>
          <div className="flex flex-col gap-2">
            {filtered.map(inv => { const { is_overdue, is_completed } = computeFlags(inv); return (
              <button key={inv.id} onClick={() => setSelectedId(inv.id)} className="border border-line bg-white hover:border-brand/40 transition-colors block w-full text-right">
                <div className="flex items-center gap-3 p-3 flex-wrap">
                  <div className="flex gap-2 flex-wrap min-w-[120px]">
                    <Bdg label={is_overdue ? 'באיחור' : inv.payment_status === 'paid' ? 'שולם' : 'ממתינה'} tone={is_overdue ? 'overdue' : inv.payment_status === 'paid' ? 'paid' : 'pending'} />
                    {inv.payment_status === 'paid' && <Bdg label={inv.receipt_status === 'received' ? 'קבלה ✓' : 'חסרה קבלה'} tone={inv.receipt_status === 'received' ? 'paid' : 'warning'} />}
                  </div>
                  <div className="flex-1 min-w-[140px]"><div className="font-medium text-sm">{inv.supplier_name}</div><div className="text-xs text-muted">מס׳ {inv.invoice_number}</div></div>
                  <div className="text-xs text-muted min-w-[85px]">{inv.due_date ? `יעד: ${fmtDate(inv.due_date)}` : ''}</div>
                  <div className="text-xs text-muted min-w-[70px]">{inv.uploaded_by}</div>
                  <div className="font-display font-bold text-sm min-w-[80px] text-left">{fmtMoney(inv.amount)}</div>
                </div>
              </button>
            ); })}
          </div>
        </>)}

        {/* ===== INVOICE DETAIL ===== */}
        {view === 'dashboard' && selected && (
          <div>
            <button onClick={() => { setSelectedId(null); setShowPayForm(false); setShowReceiptDone(false); }} className="text-sm text-muted hover:underline mb-4 inline-block">← חזרה ללוח הבקרה</button>
            <div className="border border-line bg-white max-w-2xl">
              <div className="p-5 border-b border-line flex items-start justify-between gap-3 flex-wrap">
                <div><h2 className="font-display font-bold text-lg text-brand">{selected.supplier_name}</h2><div className="text-sm text-muted">חשבונית מס׳ {selected.invoice_number}</div></div>
                <div className="font-display font-bold text-xl">{fmtMoney(selected.amount)}</div>
              </div>
              <div className="p-5 border-b border-line flex gap-2 flex-wrap">
                {(() => { const { is_overdue, is_completed } = computeFlags(selected); return (<>
                  <Bdg label={is_overdue ? 'באיחור' : selected.payment_status === 'paid' ? 'שולם' : 'ממתינה לתשלום'} tone={is_overdue ? 'overdue' : selected.payment_status === 'paid' ? 'paid' : 'pending'} />
                  {selected.payment_status === 'paid' && <Bdg label={selected.receipt_status === 'received' || showReceiptDone ? 'קבלה התקבלה' : 'חסרה קבלה'} tone={selected.receipt_status === 'received' || showReceiptDone ? 'paid' : 'warning'} />}
                  {(is_completed || (selected.payment_status === 'paid' && showReceiptDone)) && <Bdg label="הושלמה" tone="paid" />}
                </>); })()}
              </div>
              <div className="p-5 border-b border-line grid grid-cols-2 gap-3 text-sm">
                <Dtl label="תאריך חשבונית" value={fmtDate(selected.invoice_date)} />
                <Dtl label="יעד תשלום" value={selected.due_date ? fmtDate(selected.due_date) : 'לא צוין'} />
                <Dtl label="עבור מה" value={selected.description || '—'} />
                <Dtl label="הועלה ע״י" value={selected.uploaded_by} />
                <Dtl label="תאריך העלאה" value={fmtDateTime(selected.uploaded_at)} />
                {selected.supplier_email && <Dtl label="מייל ספק" value={selected.supplier_email} />}
                {selected.notes && <div className="col-span-2"><Dtl label="הערות" value={selected.notes} /></div>}
              </div>
              <div className="p-5 border-b border-line"><div className="text-xs text-muted mb-1">קובץ חשבונית</div><span className="text-sm text-brand underline cursor-pointer">צפייה / הורדה (דמו)</span></div>

              {selected.payment_status === 'paid' && (<>
                <div className="p-5 border-b border-line">
                  <div className="text-xs text-muted mb-3">פרטי תשלום</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Dtl label="תאריך תשלום" value={fmtDate(selected.payment_date)} />
                    <Dtl label="אמצעי תשלום" value={selected.payment_method || '—'} />
                    <Dtl label="מספר אסמכתא" value={selected.payment_reference || '—'} />
                  </div>
                </div>
                <div className="p-5 border-b border-line">
                  <div className="text-xs text-muted mb-2">קבלה</div>
                  {selected.receipt_status === 'received' || showReceiptDone ? (
                    <span className="text-sm text-brand underline cursor-pointer">צפייה / הורדה בקבלה (דמו)</span>
                  ) : (
                    <button onClick={() => setShowReceiptDone(true)} className="bg-brand text-white text-sm font-medium px-4 py-2 hover:opacity-90 rounded-sm">העלאת קבלה</button>
                  )}
                  {showReceiptDone && selected.receipt_status !== 'received' && <p className="text-paid text-sm mt-2 font-medium">✓ הקבלה הועלתה בהצלחה (דמו)</p>}
                </div>
              </>)}

              {selected.payment_status === 'pending' && (
                <div className="p-5">
                  {!showPayForm ? (
                    <button onClick={() => setShowPayForm(true)} className="bg-brand text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 rounded-sm">סמן כשולם</button>
                  ) : (
                    <div className="border border-line p-4 flex flex-col gap-3 max-w-md">
                      <h3 className="font-medium text-sm">פרטי תשלום</h3>
                      <DemoField label="תאריך תשלום *" /><DemoField label="אמצעי תשלום" /><DemoField label="מספר אסמכתא" /><DemoField label="קובץ אסמכתא (תמונה / PDF)" file /><DemoField label="הערה" />
                      <div className="flex gap-3">
                        <button onClick={() => setShowPayForm(false)} className="bg-brand text-white text-sm px-5 py-2 hover:opacity-90 rounded-sm">אישור תשלום (דמו)</button>
                        <button onClick={() => setShowPayForm(false)} className="border border-line text-sm px-4 py-2 rounded-sm">ביטול</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== NEW INVOICE VIEW ===== */}
        {view === 'new-invoice' && (
          <div className="max-w-xl">
            <h2 className="font-display font-bold text-xl mb-1 text-brand">חשבונית חדשה</h2>
            <p className="text-sm text-muted mb-6">מלאו את הפרטים והעלו את קובץ החשבונית. הסטטוס הראשוני יהיה "ממתינה לתשלום".</p>
            {showNewSuccess ? (
              <div className="bg-paidBg border border-paid/20 p-6 text-center">
                <p className="font-display font-bold text-lg text-paid mb-1">החשבונית נשלחה בהצלחה!</p>
                <p className="text-sm text-muted mb-4">החשבונית נוספה למערכת וממתינה לתשלום.</p>
                <button onClick={() => { setShowNewSuccess(false); setView('dashboard'); }} className="bg-brand text-white text-sm px-5 py-2 rounded-sm hover:opacity-90">חזרה ללוח הבקרה</button>
              </div>
            ) : (
              <div className="bg-white border border-line p-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DemoField label="שם ספק *" placeholder="לדוגמה: הוצאה לאור, קייטרינג" />
                  <DemoField label="מייל ספק" placeholder="supplier@example.com" />
                  <DemoField label="מספר חשבונית *" placeholder="INV-1234" />
                  <DemoField label="תאריך חשבונית *" type="date" />
                  <DemoField label="תאריך אחרון לתשלום" type="date" />
                  <DemoField label="סכום (₪) *" placeholder="0" type="number" />
                </div>
                <DemoField label="קובץ החשבונית (תמונה / PDF)" file />
                <DemoField label="עבור מה" placeholder="הדפסת חוברות, ציוד משרדי..." textarea />
                <DemoField label="הערות" placeholder="פרטים נוספים..." textarea />
                <button onClick={() => setShowNewSuccess(true)} className="self-start bg-brand text-white font-medium text-sm px-6 py-2.5 hover:opacity-90 rounded-sm">שליחת חשבונית</button>
              </div>
            )}
          </div>
        )}

        {/* ===== REPORTS VIEW ===== */}
        {view === 'reports' && (
          <div>
            <h2 className="font-display font-bold text-xl mb-2 text-brand">דוחות</h2>
            <p className="text-sm text-muted mb-6">סיכום חשבוניות ששולמו — סה״כ {fmtMoney(grandTotal)} ב-{paidInvoices.length} חשבוניות. לחצו על שורה לפירוט.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-line bg-white">
                <div className="p-4 border-b border-line font-medium text-sm">לפי חודש תשלום</div>
                <div className="divide-y divide-line">
                  {byMonth.map(({ month, label, items, total }) => (
                    <div key={month}>
                      <button onClick={() => setExpandedMonth(expandedMonth === month ? null : month)} className="w-full p-3 flex justify-between items-center text-sm hover:bg-paper transition-colors">
                        <span className="flex items-center gap-2"><span className="text-xs text-muted">{expandedMonth === month ? '▾' : '▸'}</span>{label}</span>
                        <div className="text-left"><span className="font-display font-bold">{fmtMoney(total)}</span><span className="text-xs text-muted mr-2">({items.length})</span></div>
                      </button>
                      {expandedMonth === month && <div className="bg-paper border-t border-line">{items.map(inv => (
                        <button key={inv.id} onClick={() => { setView('dashboard'); setSelectedId(inv.id); }} className="flex justify-between items-center px-6 py-2 text-xs hover:bg-line/30 w-full text-right border-b border-line/50 last:border-b-0">
                          <div><span className="font-medium text-sm">{inv.supplier_name}</span><span className="text-muted mr-2">מס׳ {inv.invoice_number}</span></div>
                          <div className="text-left"><span className="font-display font-bold text-sm">{fmtMoney(inv.amount)}</span><span className="text-muted mr-2">{fmtDate(inv.payment_date)}</span></div>
                        </button>
                      ))}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-line bg-white">
                <div className="p-4 border-b border-line font-medium text-sm">לפי ספק</div>
                <div className="divide-y divide-line">
                  {bySupplier.map(({ supplier, items, total }) => (
                    <div key={supplier}>
                      <button onClick={() => setExpandedSupplier(expandedSupplier === supplier ? null : supplier)} className="w-full p-3 flex justify-between items-center text-sm hover:bg-paper transition-colors">
                        <span className="flex items-center gap-2"><span className="text-xs text-muted">{expandedSupplier === supplier ? '▾' : '▸'}</span>{supplier}</span>
                        <div className="text-left"><span className="font-display font-bold">{fmtMoney(total)}</span><span className="text-xs text-muted mr-2">({items.length})</span></div>
                      </button>
                      {expandedSupplier === supplier && <div className="bg-paper border-t border-line">{items.map(inv => (
                        <button key={inv.id} onClick={() => { setView('dashboard'); setSelectedId(inv.id); }} className="flex justify-between items-center px-6 py-2 text-xs hover:bg-line/30 w-full text-right border-b border-line/50 last:border-b-0">
                          <div><span className="text-muted">מס׳ {inv.invoice_number}</span><span className="text-muted mr-2">{fmtDate(inv.invoice_date)}</span></div>
                          <div className="text-left"><span className="font-display font-bold text-sm">{fmtMoney(inv.amount)}</span><span className="text-muted mr-2">{fmtDate(inv.payment_date)}</span></div>
                        </button>
                      ))}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-brand text-white py-10 mt-12">
        <div className="max-w-lg mx-auto text-center px-4">
          <h2 className="font-display font-bold text-xl mb-3">מעוניינים במערכת דומה עבור הארגון שלכם?</h2>
          <p className="text-sm text-white/70 mb-6">המערכת מותאמת אישית לצרכים של מוסדות חינוך, עמותות וארגונים. כולל: הרשאות, העלאת קבצים, מעקב תשלומים, דוחות, והתראות מייל.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <a href="mailto:DB0533139917@GMAIL.COM?subject=מעוניין/ת במערכת מעקב חשבוניות" className="inline-block bg-white text-brand font-bold text-sm px-8 py-3 hover:bg-brandPinkLight transition-colors rounded-sm">שלחו מייל</a>
            <a href="tel:0533139917" className="inline-block border border-white/40 text-white font-medium text-sm px-8 py-3 hover:bg-white/10 transition-colors rounded-sm">חייגו 053-313-9917</a>
          </div>
          <div className="flex justify-center items-center gap-3 pt-4 border-t border-white/10">
            <Image src="/dasi-logo.png" alt="Dasi Zipora" width={120} height={40} className="brightness-0 invert" />
            <span className="text-xs text-white/50">אוטומציות חכמות לעסקים חכמים</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================
function StatCard({ label, count, tone, active, onClick }: { label: string; count: number | string; tone: string; active?: boolean; onClick?: () => void }) {
  const bg: Record<string, string> = { pending:'bg-pendingBg', overdue:'bg-overdueBg', warning:'bg-orange-50', paid:'bg-paidBg', neutral:'bg-white' };
  const fg: Record<string, string> = { pending:'text-pending', overdue:'text-overdue', warning:'text-orange-600', paid:'text-paid', neutral:'text-brand' };
  return (<button onClick={onClick} className={`border p-3 text-center transition-all ${active ? 'border-brand ring-1 ring-brand' : 'border-line'} ${bg[tone]||'bg-white'} ${onClick ? 'cursor-pointer hover:border-brand' : 'cursor-default'}`}><div className={`font-display font-bold text-xl ${fg[tone]||'text-brand'}`}>{count}</div><div className="text-xs text-muted mt-1 leading-tight">{label}</div></button>);
}
function Bdg({ label, tone }: { label: string; tone: string }) {
  const c: Record<string, string> = { pending:'bg-pendingBg text-pending', paid:'bg-paidBg text-paid', overdue:'bg-overdueBg text-overdue', warning:'bg-orange-50 text-orange-600' };
  return <span className={`text-xs font-semibold px-2 py-0.5 whitespace-nowrap ${c[tone]||c.pending}`}>{label}</span>;
}
function Dtl({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted">{label}</div><div className="mt-0.5 text-sm">{value}</div></div>;
}
function DemoField({ label, placeholder, type, textarea, file }: { label: string; placeholder?: string; type?: string; textarea?: boolean; file?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted">{label}</label>
      {file ? <input type="file" accept="image/*,.pdf" className="text-sm" /> :
       textarea ? <textarea placeholder={placeholder} className="border border-line px-3 py-2 text-sm bg-brandPinkPale/50 min-h-[50px]" /> :
       <input type={type || 'text'} placeholder={placeholder} className="border border-line px-3 py-2 text-sm bg-brandPinkPale/50" />}
    </div>
  );
}
