import { NextResponse, type NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// נתיב שנועד לשימוש של Make בלבד (לא של משתמשים).
// מחזיר את החשבוניות ששולמו לפני יותר מ-DAYS_THRESHOLD ימים ועדיין חסרה להן קבלה.
//
// אבטחה: הנתיב מוגן במפתח סודי שנשלח בכותרת x-reminder-secret,
// כי אין כאן משתמש מחובר שאפשר לזהות דרך ה-session.
// המפתח מוגדר במשתנה הסביבה REMINDER_SECRET ב-Vercel.

const DAYS_THRESHOLD = 7;

export async function GET(request: NextRequest) {
  const secret = process.env.REMINDER_SECRET;

  // אם לא הוגדר סוד בכלל - חוסמים, כדי לא להשאיר נתיב פתוח בטעות
  if (!secret) {
    return NextResponse.json({ error: 'הנתיב אינו מוגדר' }, { status: 503 });
  }

  const provided =
    request.headers.get('x-reminder-secret') ??
    new URL(request.url).searchParams.get('secret');

  if (provided !== secret) {
    return NextResponse.json({ error: 'אין הרשאה' }, { status: 401 });
  }

  // תאריך הסף: היום פחות DAYS_THRESHOLD ימים
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_THRESHOLD);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const service = createServiceRoleClient();

  const { data, error } = await service
    .from('invoices')
    .select('id, supplier_name, supplier_email, invoice_number, amount, payment_date, payment_method, payment_reference, description')
    .eq('payment_status', 'paid')
    .eq('receipt_status', 'missing')
    .lte('payment_date', cutoffStr)
    .order('payment_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const invoices = data ?? [];

  // מחשבים כמה ימים עברו מאז התשלום, כדי שאפשר יהיה להציג את זה במייל
  const today = new Date();
  const enriched = invoices.map((inv) => {
    const paid = new Date(inv.payment_date as string);
    const daysSince = Math.floor((today.getTime() - paid.getTime()) / (1000 * 60 * 60 * 24));
    return { ...inv, days_since_payment: daysSince };
  });

  const totalAmount = enriched.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return NextResponse.json({
    count: enriched.length,
    total_amount: totalAmount,
    threshold_days: DAYS_THRESHOLD,
    generated_at: new Date().toISOString(),
    invoices: enriched,
  });
}
