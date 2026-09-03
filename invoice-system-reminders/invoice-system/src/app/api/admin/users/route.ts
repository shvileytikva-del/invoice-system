import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

async function getAdmin(supabase: ReturnType<typeof createServerSupabaseClient>) {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const { data: appUser } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  if (!appUser || !appUser.is_active || appUser.role !== 'admin') return null;
  return appUser;
}

// GET - list all users
export async function GET() {
  const supabase = createServerSupabaseClient();
  const admin = await getAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users });
}

// POST - add a new user (by email, after they've logged in once with Google)
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const admin = await getAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });

  const { email, name, role } = await request.json();
  if (!email || !name || !role) {
    return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
  }
  if (!['school_user', 'secretary', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'תפקיד לא תקין' }, { status: 400 });
  }

  // Look up the auth user by email using service role
  const service = createServiceRoleClient();
  const { data: authUsers } = await service.auth.admin.listUsers();
  const authUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  if (!authUser) {
    return NextResponse.json(
      { error: `המשתמש/ת ${email} לא נמצא/ה. הם צריכים קודם להיכנס לאתר פעם אחת עם Google (יגיעו למסך "אין הרשאה"), ואז לחזור לכאן ולנסות שוב.` },
      { status: 404 }
    );
  }

  // Check if already in users table
  const { data: existing } = await supabase.from('users').select('id').eq('id', authUser.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'המשתמש/ת כבר קיים/ת במערכת' }, { status: 409 });
  }

  const { data: newUser, error } = await service
    .from('users')
    .insert({ id: authUser.id, email: email.toLowerCase(), name, role, is_active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'הוספת המשתמש/ת נכשלה: ' + error.message }, { status: 500 });

  return NextResponse.json({ user: newUser }, { status: 201 });
}

// PUT - update user role or active status
export async function PUT(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const admin = await getAdmin(supabase);
  if (!admin) return NextResponse.json({ error: 'אין הרשאה' }, { status: 403 });

  const { id, role, is_active } = await request.json();
  if (!id) return NextResponse.json({ error: 'חסר מזהה משתמש' }, { status: 400 });

  // Prevent admin from deactivating themselves
  if (id === admin.id && is_active === false) {
    return NextResponse.json({ error: 'לא ניתן להשבית את עצמך' }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (role && ['school_user', 'secretary', 'admin'].includes(role)) updates.role = role;
  if (typeof is_active === 'boolean') updates.is_active = is_active;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'אין שינויים' }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data: updated, error } = await service
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'עדכון המשתמש נכשל: ' + error.message }, { status: 500 });

  return NextResponse.json({ user: updated });
}
