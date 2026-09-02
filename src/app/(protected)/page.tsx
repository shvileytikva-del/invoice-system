import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await requireUser();

  if (user.role === 'school_user') {
    redirect('/my-invoices');
  }

  // Dashboard מלא (כרטיסי סטטוס + טבלה + סינון) ייבנה בשלב 2.
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="font-display font-bold text-2xl mb-2">שלום, {user.name}</h1>
      <p className="text-muted text-sm">
        ה-Dashboard המלא (חשבוניות ממתינות, חסרות קבלה, הושלמו, וסך הכל) יתווסף בשלב הבא.
        בינתיים, אפשר להעלות חשבונית חדשה דרך התפריט למעלה.
      </p>
    </div>
  );
}
