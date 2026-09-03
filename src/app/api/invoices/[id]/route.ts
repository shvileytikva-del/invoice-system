import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

// DELETE - מחיקת חשבונית (admin בלבד)
// מוחק גם את הקבצים המשויכים ואת רשומות היומן, כדי לא להשאיר "יתומים".
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });

  const { data: appUser } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (!appUser || !appUser.is_active || appUser.role !== 'admin') {
    return NextResponse.json({ error: 'רק מנהל/ת יכול/ה למחוק חשבוניות' }, { status: 403 });
  }

  // שליפת החשבונית כדי לדעת אילו קבצים למחוק
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json({ error: 'החשבונית לא נמצאה' }, { status: 404 });
  }

  const service = createServiceRoleClient();

  // מחיקת הקבצים מהאחסון
  const invoiceBucketFiles: string[] = [];
  if (invoice.invoice_file) invoiceBucketFiles.push(invoice.invoice_file);
  if (invoice.payment_proof_file) invoiceBucketFiles.push(invoice.payment_proof_file);
  if (invoiceBucketFiles.length > 0) {
    await service.storage.from('invoices').remove(invoiceBucketFiles);
  }
  if (invoice.receipt_file) {
    await service.storage.from('receipts').remove([invoice.receipt_file]);
  }

  // מחיקת רשומות היומן המשויכות (חייב לפני מחיקת החשבונית)
  await service.from('activity_log').delete().eq('invoice_id', params.id);

  // מחיקת החשבונית עצמה
  const { error } = await service.from('invoices').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'מחיקת החשבונית נכשלה: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
