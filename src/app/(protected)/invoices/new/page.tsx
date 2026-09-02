'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export default function NewInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    supplier_name: '',
    invoice_number: '',
    invoice_date: '',
    amount: '',
    description: '',
    due_date: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (f && f.size > MAX_FILE_SIZE) {
      setFileError('הקובץ גדול מדי (מקסימום 8MB)');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.supplier_name || !form.invoice_number || !form.invoice_date || !form.due_date || !form.amount) {
      setError('נא למלא את כל שדות החובה');
      return;
    }
    if (Number(form.amount) <= 0) {
      setError('הסכום חייב להיות גדול מאפס');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const invoiceId = crypto.randomUUID();
    let invoiceFilePath: string | null = null;

    try {
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u0590-\u05FF ]/g, '_');
        const path = `${invoiceId}/${safeName}`;
        const { error: uploadError } = await supabase.storage.from('invoices').upload(path, file, {
          upsert: false,
        });
        if (uploadError) {
          throw new Error('העלאת הקובץ נכשלה: ' + uploadError.message);
        }
        invoiceFilePath = path;
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoiceId,
          ...form,
          amount: Number(form.amount),
          invoice_file: invoiceFilePath,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // אם השמירה בטבלה נכשלה אחרי שהקובץ כבר הועלה - מנקים את הקובץ היתום
        if (invoiceFilePath) {
          await supabase.storage.from('invoices').remove([invoiceFilePath]);
        }
        throw new Error(data.error || 'שמירת החשבונית נכשלה');
      }

      setSuccess(true);
      setTimeout(() => router.push('/my-invoices'), 1200);
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה. נסו שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center border border-paidBg bg-paidBg p-8">
        <p className="font-display font-bold text-lg text-paid mb-1">החשבונית נשלחה בהצלחה</p>
        <p className="text-sm text-muted">מעבירים אותך לרשימת החשבוניות שלך...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-1">חשבונית חדשה</h1>
      <p className="text-sm text-muted mb-8">מלאו את הפרטים והעלו את קובץ החשבונית. הסטטוס הראשוני יהיה "ממתינה לתשלום".</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-line p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="שם ספק *">
            <input
              type="text"
              className="itr-input"
              value={form.supplier_name}
              onChange={(e) => update('supplier_name', e.target.value)}
              required
            />
          </Field>
          <Field label="מספר חשבונית *">
            <input
              type="text"
              className="itr-input"
              value={form.invoice_number}
              onChange={(e) => update('invoice_number', e.target.value)}
              required
            />
          </Field>
          <Field label="תאריך חשבונית *">
            <input
              type="date"
              className="itr-input"
              value={form.invoice_date}
              onChange={(e) => update('invoice_date', e.target.value)}
              required
            />
          </Field>
          <Field label="תאריך אחרון לתשלום *">
            <input
              type="date"
              className="itr-input"
              value={form.due_date}
              onChange={(e) => update('due_date', e.target.value)}
              required
            />
          </Field>
          <Field label="סכום (₪) *">
            <input
              type="number"
              min="0"
              step="0.01"
              className="itr-input"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              required
            />
          </Field>
          <Field label="קובץ החשבונית (תמונה / PDF)">
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="text-sm" />
          </Field>
        </div>
        {fileError && <p className="text-overdue text-xs -mt-2">{fileError}</p>}

        <Field label="עבור מה">
          <textarea
            className="itr-input min-h-[70px]"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>

        <Field label="הערות">
          <textarea
            className="itr-input min-h-[60px]"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </Field>

        {error && <p className="text-overdue text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="self-start bg-ink text-white font-medium text-sm px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'שולח...' : 'שליחת חשבונית'}
        </button>
      </form>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}
