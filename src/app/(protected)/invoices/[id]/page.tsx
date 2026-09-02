import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { computeInvoiceFlags } from '@/lib/types';
import InvoiceDetailClient from './InvoiceDetailClient';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const supabase = createServerSupabaseClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, uploader:users!uploaded_by(name, email)')
    .eq('id', params.id)
    .maybeSingle();

  if (!invoice) {
    notFound();
  }

  const { is_overdue, is_completed } = computeInvoiceFlags(invoice);

  // Generate signed URLs for files
  let invoiceFileUrl: string | null = null;
  let receiptFileUrl: string | null = null;

  if (invoice.invoice_file) {
    const { data } = await supabase.storage
      .from('invoices')
      .createSignedUrl(invoice.invoice_file, 3600);
    invoiceFileUrl = data?.signedUrl ?? null;
  }

  if (invoice.receipt_file) {
    const { data } = await supabase.storage
      .from('receipts')
      .createSignedUrl(invoice.receipt_file, 3600);
    receiptFileUrl = data?.signedUrl ?? null;
  }

  const enriched = {
    ...invoice,
    is_overdue,
    is_completed,
    uploader_name: invoice.uploader?.name ?? '—',
  };

  return (
    <InvoiceDetailClient
      invoice={enriched}
      invoiceFileUrl={invoiceFileUrl}
      receiptFileUrl={receiptFileUrl}
      userRole={user.role}
    />
  );
}
