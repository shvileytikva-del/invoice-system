import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!appUser || !appUser.is_active) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });
  }

  const body = await request.json();
  const {
    id, // מזהה שנוצר בצד הלקוח לפני העלאת הקובץ (כדי שנתיב האחסון יהיה עקבי)
    supplier_name,
    invoice_number,
    invoice_date,
    amount,
    description,
    due_date,
    notes,
    invoice_file,
  } = body;

  // ולידציה בסיסית בצד השרת
  if (!supplier_name || !invoice_number || !invoice_date || !due_date || !amount) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }
  if (Number(amount) <= 0) {
    return NextResponse.json({ error: 'הסכום חייב להיות גדול מאפס' }, { status: 400 });
  }

  // בדיקת כפילות ידידותית לפני ה-insert (ה-constraint ב-DB חוסם בכל מקרה כגיבוי)
  const { data: existing } = await supabase
    .from('invoices')
    .select('id')
    .eq('supplier_name', supplier_name)
    .eq('invoice_number', invoice_number)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: `כבר קיימת חשבונית עם מספר "${invoice_number}" מהספק "${supplier_name}"` },
      { status: 409 }
    );
  }

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      id,
      supplier_name,
      invoice_number,
      invoice_date,
      amount,
      description: description || null,
      due_date,
      notes: notes || null,
      invoice_file: invoice_file || null,
      uploaded_by: appUser.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `כבר קיימת חשבונית עם מספר "${invoice_number}" מהספק "${supplier_name}"` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'שמירת החשבונית נכשלה: ' + error.message }, { status: 500 });
  }

  await logActivity({
    userId: appUser.id,
    action: `${appUser.name} העלה/תה חשבונית חדשה מספק "${supplier_name}"`,
    invoiceId: inserted.id,
    newValue: inserted,
  });

  return NextResponse.json({ invoice: inserted }, { status: 201 });
}
