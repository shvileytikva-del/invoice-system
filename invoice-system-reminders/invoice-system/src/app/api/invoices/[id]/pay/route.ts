import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activityLog';
import { sendWebhook } from '@/lib/webhook';

// POST - mark as paid
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });

  const { data: appUser } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (!appUser || !appUser.is_active || !['secretary', 'admin'].includes(appUser.role)) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
  }

  const body = await request.json();
  const { payment_date, payment_method, payment_reference, payment_note, payment_proof_file } = body;

  if (!payment_date) {
    return NextResponse.json({ error: 'חסר תאריך תשלום' }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from('invoices')
    .update({
      payment_status: 'paid',
      payment_date,
      payment_method: payment_method || null,
      payment_reference: payment_reference || null,
      payment_note: payment_note || null,
      payment_proof_file: payment_proof_file || null,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'עדכון התשלום נכשל: ' + error.message }, { status: 500 });
  }

  await logActivity({
    userId: appUser.id,
    action: `${appUser.name} סימן/ה חשבונית מספק "${updated.supplier_name}" (${updated.invoice_number}) כשולמה`,
    invoiceId: params.id,
    oldValue: { payment_status: 'pending' },
    newValue: { payment_status: 'paid', payment_date, payment_method, payment_reference },
  });

  await sendWebhook({
    event: 'invoice_paid',
    invoice: updated,
    performed_by: appUser.name,
  });

  return NextResponse.json({ invoice: updated });
}

// DELETE - undo payment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });

  const { data: appUser } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (!appUser || !appUser.is_active || !['secretary', 'admin'].includes(appUser.role)) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
  }

  const { data: updated, error } = await supabase
    .from('invoices')
    .update({
      payment_status: 'pending',
      payment_date: null,
      payment_method: null,
      payment_reference: null,
      payment_note: null,
      payment_proof_file: null,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'ביטול התשלום נכשל: ' + error.message }, { status: 500 });
  }

  await logActivity({
    userId: appUser.id,
    action: `${appUser.name} ביטל/ה סימון תשלום של חשבונית "${updated.supplier_name}" (${updated.invoice_number})`,
    invoiceId: params.id,
    oldValue: { payment_status: 'paid' },
    newValue: { payment_status: 'pending' },
  });

  return NextResponse.json({ invoice: updated });
}
