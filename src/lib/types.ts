export type UserRole = 'school_user' | 'secretary' | 'admin';
export type PaymentStatus = 'pending' | 'paid';
export type ReceiptStatus = 'missing' | 'received';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string; // YYYY-MM-DD
  amount: number;
  description: string | null;
  due_date: string; // YYYY-MM-DD

  uploaded_by: string;
  uploaded_at: string;

  payment_status: PaymentStatus;
  payment_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  payment_note: string | null;

  receipt_status: ReceiptStatus;

  invoice_file: string | null;
  receipt_file: string | null;

  notes: string | null;
  updated_at: string;
}

// invoice בתוספת שדות מחושבים בצד קליינט/שרת (לא נשמרים בטבלה)
export interface InvoiceWithComputed extends Invoice {
  is_overdue: boolean;
  is_completed: boolean;
  uploader_name?: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  invoice_id: string | null;
  timestamp: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
}

export function computeInvoiceFlags(inv: Invoice): { is_overdue: boolean; is_completed: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const is_completed = inv.payment_status === 'paid' && inv.receipt_status === 'received';
  const is_overdue = inv.payment_status === 'pending' && inv.due_date < today;
  return { is_overdue, is_completed };
}
