import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'מעקב חשבוניות - תיכון',
  description: 'מערכת לניהול ומעקב חשבוניות ותשלומים',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
