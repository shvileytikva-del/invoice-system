import { createServiceRoleClient } from '@/lib/supabase/server';

interface LogParams {
  userId: string;
  action: string;
  invoiceId: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

// כתיבה ל-activity_log חייבת לעבור דרך service role, כי מדיניות ה-RLS
// חוסמת לחלוטין insert ישיר מצד הלקוח (ראה activity_log_insert_none ב-schema.sql).
// כך מובטח שהיומן משקף רק פעולות שאכן עברו דרך לוגיקת השרת שלנו.
export async function logActivity({ userId, action, invoiceId, oldValue = null, newValue = null }: LogParams) {
  const service = createServiceRoleClient();
  const { error } = await service.from('activity_log').insert({
    user_id: userId,
    action,
    invoice_id: invoiceId,
    old_value: oldValue,
    new_value: newValue,
  });
  if (error) {
    // לא זורקים שגיאה כדי לא לחסום את הפעולה העיקרית - אבל חשוב לתעד
    console.error('activity_log insert failed:', error.message);
  }
}
