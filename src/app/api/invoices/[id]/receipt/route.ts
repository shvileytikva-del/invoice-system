import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });

  const { data: appUser } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (!appUser || !appUser.is_active || !['secretary', 'admin'].includes(appUser.role)) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
  }

  const body = await request.json();
  const { receipt_file } = body;

  if (!receipt_file) {
    return NextResponse.json({ error: 'חסר נתיב קובץ הקבלה' }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from('invoices')
    .update({
      receipt_file,
      receipt_status: 'received',
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'שמירת הקבלה נכשלה: ' + error.message }, { status: 500 });
  }

  await logActivity({
    userId: appUser.id,
    action: `${appUser.name} העלה/תה קבלה לחשבונית "${updated.supplier_name}" (${updated.invoice_number})`,
    invoiceId: params.id,
    oldValue: { receipt_status: 'missing' },
    newValue: { receipt_status: 'received', receipt_file },
  });

  return NextResponse.json({ invoice: updated });
}
