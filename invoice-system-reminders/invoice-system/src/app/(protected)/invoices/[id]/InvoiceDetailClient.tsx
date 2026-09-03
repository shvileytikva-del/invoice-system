'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { InvoiceWithComputed, UserRole } from '@/lib/types';
import { formatDate, formatDateTime, formatMoney, paymentStatusLabel, receiptStatusLabel } from '@/lib/utils';

interface Props {
  invoice: InvoiceWithComputed;
  invoiceFileUrl: string | null;
  receiptFileUrl: string | null;
  paymentProofFileUrl: string | null;
  userRole: UserRole;
}

export default function InvoiceDetailClient({ invoice, invoiceFileUrl, receiptFileUrl, paymentProofFileUrl, userRole }: Props) {
  const router = useRouter();
  const canEdit = userRole === 'secretary' || userRole === 'admin';
  const isAdmin = userRole === 'admin';
  const [showPayForm, setShowPayForm] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payForm, setPayForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    payment_reference: '',
    payment_note: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  async function handleMarkPaid(e: React.FormEvent) {
    e.preventDefault();
    setPayLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let proofFilePath: string | null = null;

      if (proofFile) {
        if (proofFile.size > 8 * 1024 * 1024) {
          throw new Error('קובץ האסמכתא גדול מדי (מקסימום 8MB)');
        }
        const ext = proofFile.name.split('.').pop() || 'pdf';
        const safeName = 'proof_' + Date.now() + '.' + ext;
        const path = `${invoice.id}/${safeName}`;
        const { error: uploadError } = await supabase.storage.from('invoices').upload(path, proofFile, { upsert: true });
        if (uploadError) throw new Error('העלאת קובץ האסמכתא נכשלה: ' + uploadError.message);
        proofFilePath = path;
      }

      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payForm,
          payment_proof_file: proofFilePath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה בסימון תשלום');
      router.refresh();
      setShowPayForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPayLoading(false);
    }
  }

  async function handleMarkUnpaid() {
    if (!confirm('האם לבטל את סימון התשלום?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'שגיאה');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    const ok = confirm(
      `למחוק לצמיתות את החשבונית מ"${invoice.supplier_name}" (מס׳ ${invoice.invoice_number})?\n\nהפעולה תמחק גם את קובץ החשבונית והקבלה, ולא ניתן לשחזר.`
    );
    if (!ok) return;

    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'מחיקת החשבונית נכשלה');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleteLoading(false);
    }
  }

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('הקובץ גדול מדי (מקסימום 8MB)');
      return;
    }
    setReceiptLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'pdf';
      const safeName = 'receipt_' + Date.now() + '.' + ext;
      const path = `${invoice.id}/${safeName}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, file, { upsert: true });
      if (uploadError) throw new Error('העלאת הקובץ נכשלה: ' + uploadError.message);

      const res = await fetch(`/api/invoices/${invoice.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_file: path }),
      });
      const data = await res.json();
      if (!res.ok) {
        await supabase.storage.from('receipts').remove([path]);
        throw new Error(data.error || 'שמירת הקבלה נכשלה');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReceiptLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-muted hover:underline underline-offset-2 mb-4 inline-block">
        ← חזרה ללוח הבקרה
      </Link>

      <div className="border border-line bg-white">
        {/* Header */}
        <div className="p-5 border-b border-line flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-xl">{invoice.supplier_name}</h1>
            <div className="text-sm text-muted mt-1">חשבונית מס׳ {invoice.invoice_number}</div>
          </div>
          <div className="font-display font-bold text-2xl">{formatMoney(invoice.amount)}</div>
        </div>

        {/* Status Badges */}
        <div className="p-5 border-b border-line flex gap-3 flex-wrap">
          <Badge
            label={invoice.is_overdue ? 'באיחור' : paymentStatusLabel(invoice.payment_status)}
            tone={invoice.is_overdue ? 'overdue' : invoice.payment_status === 'paid' ? 'paid' : 'pending'}
          />
          {invoice.payment_status === 'paid' && (
            <Badge
              label={receiptStatusLabel(invoice.receipt_status)}
              tone={invoice.receipt_status === 'received' ? 'paid' : 'warning'}
            />
          )}
          {invoice.is_completed && <Badge label="הושלמה" tone="paid" />}
        </div>

        {/* Details */}
        <div className="p-5 border-b border-line grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Detail label="תאריך חשבונית" value={formatDate(invoice.invoice_date)} />
          <Detail label="תאריך אחרון לתשלום" value={invoice.due_date ? formatDate(invoice.due_date) : 'לא צוין'} />
          <Detail label="מייל ספק" value={(invoice as any).supplier_email || '—'} />
          <Detail label="עבור מה" value={invoice.description || '—'} />
          <Detail label="הועלה ע״י" value={invoice.uploader_name ?? '—'} />
          <Detail label="תאריך העלאה" value={formatDateTime(invoice.uploaded_at)} />
          {invoice.notes && <Detail label="הערות" value={invoice.notes} full />}
        </div>

        {/* Invoice File */}
        <div className="p-5 border-b border-line">
          <div className="text-xs text-muted mb-2">קובץ חשבונית</div>
          {invoiceFileUrl ? (
            <a href={invoiceFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline underline-offset-2">
              צפייה / הורדה
            </a>
          ) : (
            <span className="text-sm text-muted">לא צורף קובץ</span>
          )}
        </div>

        {/* Payment Details */}
        {invoice.payment_status === 'paid' && (
          <div className="p-5 border-b border-line">
            <div className="text-xs text-muted mb-3">פרטי תשלום</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Detail label="תאריך תשלום" value={formatDate(invoice.payment_date)} />
              <Detail label="אמצעי תשלום" value={invoice.payment_method || '—'} />
              <Detail label="מספר אסמכתא" value={invoice.payment_reference || '—'} />
              {invoice.payment_note && <Detail label="הערת תשלום" value={invoice.payment_note} full />}
            </div>
            <div className="mt-3">
              <div className="text-xs text-muted mb-1">קובץ אסמכתא</div>
              {paymentProofFileUrl ? (
                <a href={paymentProofFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline underline-offset-2">
                  צפייה / הורדה באסמכתא
                </a>
              ) : (
                <span className="text-sm text-muted">לא צורף קובץ אסמכתא</span>
              )}
            </div>
          </div>
        )}

        {/* Receipt */}
        {invoice.payment_status === 'paid' && (
          <div className="p-5 border-b border-line">
            <div className="text-xs text-muted mb-2">קבלה</div>
            {receiptFileUrl ? (
              <a href={receiptFileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium underline underline-offset-2">
                צפייה / הורדה בקבלה
              </a>
            ) : canEdit ? (
              <div>
                <label className="inline-block bg-ink text-white text-sm font-medium px-4 py-2 cursor-pointer hover:opacity-90 transition-opacity">
                  {receiptLoading ? 'מעלה...' : 'העלאת קבלה'}
                  <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} disabled={receiptLoading} className="hidden" />
                </label>
              </div>
            ) : (
              <span className="text-sm text-muted">טרם צורפה קבלה</span>
            )}
          </div>
        )}

        {/* Actions */}
        {canEdit && (
          <div className="p-5">
            {error && <p className="text-overdue text-sm mb-3">{error}</p>}

            {invoice.payment_status === 'pending' && !showPayForm && (
              <button
                onClick={() => setShowPayForm(true)}
                className="bg-ink text-white font-medium text-sm px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                סמן כשולם
              </button>
            )}

            {invoice.payment_status === 'paid' && (
              <button
                onClick={handleMarkUnpaid}
                className="border border-ink text-ink font-medium text-sm px-5 py-2.5 hover:bg-ink hover:text-white transition-colors"
              >
                בטל סימון תשלום
              </button>
            )}

            {showPayForm && (
              <form onSubmit={handleMarkPaid} className="mt-4 border border-line p-4 flex flex-col gap-3 max-w-md">
                <h3 className="font-medium text-sm">פרטי תשלום</h3>
                <Field label="תאריך תשלום *">
                  <input type="date" required className="itr-input" value={payForm.payment_date}
                    onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))} />
                </Field>
                <Field label="אמצעי תשלום">
                  <input type="text" placeholder="העברה בנקאית, צ׳ק, אשראי..." className="itr-input" value={payForm.payment_method}
                    onChange={(e) => setPayForm((f) => ({ ...f, payment_method: e.target.value }))} />
                </Field>
                <Field label="מספר אסמכתא">
                  <input type="text" className="itr-input" value={payForm.payment_reference}
                    onChange={(e) => setPayForm((f) => ({ ...f, payment_reference: e.target.value }))} />
                </Field>
                <Field label="קובץ אסמכתא (תמונה / PDF)">
                  <input type="file" accept="image/*,.pdf" className="text-sm"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                </Field>
                <Field label="הערה">
                  <textarea className="itr-input min-h-[50px]" value={payForm.payment_note}
                    onChange={(e) => setPayForm((f) => ({ ...f, payment_note: e.target.value }))} />
                </Field>
                <div className="flex gap-3">
                  <button type="submit" disabled={payLoading}
                    className="bg-ink text-white font-medium text-sm px-5 py-2 hover:opacity-90 disabled:opacity-50">
                    {payLoading ? 'שומר...' : 'אישור תשלום'}
                  </button>
                  <button type="button" onClick={() => setShowPayForm(false)}
                    className="border border-line text-sm px-4 py-2">
                    ביטול
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Delete (admin only) */}
        {isAdmin && !showPayForm && (
          <div className="p-5 border-t border-line bg-paper/40">
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="border border-overdue text-overdue font-medium text-sm px-5 py-2 hover:bg-overdueBg transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'מוחק...' : 'מחיקת חשבונית'}
            </button>
            <p className="text-xs text-muted mt-2">
              המחיקה קבועה ומוחקת גם את קובץ החשבונית והקבלה. זמין למנהל/ת בלבד.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .itr-input {
          width: 100%;
          font-family: 'Heebo', sans-serif;
          font-size: 14px;
          padding: 8px 10px;
          border: 1px solid #C7C0AF;
          background: #FCFBF8;
        }
      `}</style>
    </div>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: 'pending' | 'paid' | 'overdue' | 'warning' }) {
  const classes = {
    pending: 'bg-pendingBg text-pending',
    paid: 'bg-paidBg text-paid',
    overdue: 'bg-overdueBg text-overdue',
    warning: 'bg-orange-50 text-orange-600',
  }[tone];
  return <span className={`text-sm font-semibold px-3 py-1 ${classes}`}>{label}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}
