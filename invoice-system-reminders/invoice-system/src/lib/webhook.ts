// שולח אירועים ל-Make.com Webhook.
// כתובת ה-Webhook מוגדרת במשתנה סביבה MAKE_WEBHOOK_URL.
// אם המשתנה לא מוגדר - הפונקציה לא עושה כלום (כדי שהמערכת תעבוד גם בלי Make).

interface WebhookPayload {
  event: 'invoice_created' | 'invoice_paid' | 'receipt_uploaded';
  invoice: Record<string, unknown>;
  performed_by: string;
}

export async function sendWebhook(payload: WebhookPayload) {
  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) return; // Make לא מוגדר, מדלגים בשקט

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // לא חוסמים את הפעולה העיקרית אם ה-webhook נכשל
    console.error('Webhook send failed:', err);
  }
}
