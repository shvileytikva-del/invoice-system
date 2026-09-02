export function formatMoney(amount: number): string {
  return '₪' + Number(amount).toLocaleString('he-IL', { maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  if (y && m && d) return `${d}/${m}/${y}`;
  return dateStr;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'ממתינה לתשלום',
  paid: 'שולם',
};

const RECEIPT_STATUS_LABELS: Record<string, string> = {
  missing: 'חסרה קבלה',
  received: 'קבלה התקבלה',
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function receiptStatusLabel(status: string): string {
  return RECEIPT_STATUS_LABELS[status] ?? status;
}

const ROLE_LABELS: Record<string, string> = {
  school_user: 'משתמשת בית ספר',
  secretary: 'מזכיר/ה',
  admin: 'מנהל/ת',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
