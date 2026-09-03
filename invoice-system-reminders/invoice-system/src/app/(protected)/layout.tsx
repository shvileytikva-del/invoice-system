import { requireUser } from '@/lib/auth';
import NavBar from '@/components/NavBar';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-paper">
      <NavBar user={user} />
      <main>{children}</main>
    </div>
  );
}
