-- ============================================================================
-- מערכת ניהול חשבוניות - סכמת בסיס נתונים
-- הרץ את הקובץ הזה במלואו ב-Supabase SQL Editor (פרויקט חדש וריק)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('school_user', 'secretary', 'admin');
create type payment_status_enum as enum ('pending', 'paid');
create type receipt_status_enum as enum ('missing', 'received');

-- ---------------------------------------------------------------------------
-- 2. טבלת משתמשים
-- מזהה המשתמש (id) זהה למזהה שמקבל מ-Supabase Auth (auth.users.id)
-- שורה בטבלה הזו נוצרת ידנית ע"י המנהל/ת (ראה ADMIN_GUIDE.md) *לפני* שהמשתמש
-- מתחבר בפעם הראשונה, כדי שתהיה לו הרשאה מרגע הכניסה הראשון.
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role user_role not null default 'school_user',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. טבלת חשבוניות
-- ---------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),

  supplier_name text not null,
  invoice_number text not null,
  invoice_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  description text,
  due_date date not null,

  uploaded_by uuid not null references public.users(id),
  uploaded_at timestamptz not null default now(),

  payment_status payment_status_enum not null default 'pending',
  payment_date date,
  payment_method text,
  payment_reference text,
  payment_note text,

  receipt_status receipt_status_enum not null default 'missing',

  invoice_file text,   -- נתיב בתוך ה-bucket 'invoices'
  receipt_file text,   -- נתיב בתוך ה-bucket 'receipts'

  notes text,
  updated_at timestamptz not null default now(),

  -- מונע הזנת אותו מספר חשבונית פעמיים מאותו ספק (לא חוסם מספרים זהים מספקים שונים)
  constraint uniq_supplier_invoice_number unique (supplier_name, invoice_number)
);

create index idx_invoices_payment_status on public.invoices(payment_status);
create index idx_invoices_receipt_status on public.invoices(receipt_status);
create index idx_invoices_due_date on public.invoices(due_date);
create index idx_invoices_uploaded_by on public.invoices(uploaded_by);
create index idx_invoices_supplier_name on public.invoices(supplier_name);

-- ---------------------------------------------------------------------------
-- 4. טבלת activity_log (Audit Log)
-- ---------------------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  invoice_id uuid references public.invoices(id) on delete set null,
  "timestamp" timestamptz not null default now(),
  old_value jsonb,
  new_value jsonb
);

create index idx_activity_log_invoice_id on public.activity_log(invoice_id);
create index idx_activity_log_timestamp on public.activity_log("timestamp");

-- ---------------------------------------------------------------------------
-- 5. פונקציית עזר: מחזירה את התפקיד של המשתמש המחובר כרגע
-- (stable + security definer כדי שאפשר יהיה להשתמש בה בבטחה בתוך policies)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_active from public.users where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- 6. עדכון אוטומטי של updated_at בטבלת invoices
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.invoices enable row level security;
alter table public.activity_log enable row level security;

-- --- users table policies ---------------------------------------------------

-- כל משתמש מחובר ופעיל יכול לראות את רשימת המשתמשים (נדרש כדי להציג "הועלה ע״י שם")
create policy users_select_all_active
on public.users for select
using (public.is_active_user());

-- רק admin יכול להוסיף / לעדכן / למחוק משתמשים
create policy users_admin_insert
on public.users for insert
with check (public.current_user_role() = 'admin');

create policy users_admin_update
on public.users for update
using (public.current_user_role() = 'admin');

create policy users_admin_delete
on public.users for delete
using (public.current_user_role() = 'admin');

-- --- invoices table policies -------------------------------------------------

-- SELECT:
-- school_user - רואה רק חשבוניות שהיא העלתה
-- secretary / admin - רואים הכל
create policy invoices_select
on public.invoices for select
using (
  public.is_active_user()
  and (
    public.current_user_role() in ('secretary', 'admin')
    or uploaded_by = auth.uid()
  )
);

-- INSERT: כל משתמש פעיל יכול להעלות חשבונית חדשה, אבל רק בשם עצמו
create policy invoices_insert
on public.invoices for insert
with check (
  public.is_active_user()
  and uploaded_by = auth.uid()
);

-- UPDATE: רק secretary / admin יכולים לעדכן חשבונית קיימת
-- (משתמשת בית ספר לא יכולה לשנות סטטוס תשלום או כל שדה אחר אחרי ההעלאה)
create policy invoices_update_staff
on public.invoices for update
using (public.current_user_role() in ('secretary', 'admin'));

-- DELETE: רק admin
create policy invoices_delete_admin
on public.invoices for delete
using (public.current_user_role() = 'admin');

-- --- activity_log policies ---------------------------------------------------

-- secretary / admin רואים את כל היומן; school_user רואה רק רשומות של חשבוניות שלה
create policy activity_log_select
on public.activity_log for select
using (
  public.is_active_user()
  and (
    public.current_user_role() in ('secretary', 'admin')
    or invoice_id in (select id from public.invoices where uploaded_by = auth.uid())
  )
);

-- הכנסת רשומות ל-log נעשית תמיד מצד השרת (service role / API routes), לא ישירות מהלקוח
create policy activity_log_insert_none
on public.activity_log for insert
with check (false);

-- ---------------------------------------------------------------------------
-- 8. Storage buckets (invoices, receipts) - פרטיים
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- מדיניות גישה לקבצים: כל משתמש פעיל יכול להעלות; צפייה כמו בטבלת invoices
-- (המרת שם הקובץ ל-invoice_id מתבצעת ע"י שמירת הנתיב כ- {invoice_id}/{filename})

create policy storage_invoices_insert
on storage.objects for insert
with check (
  bucket_id = 'invoices'
  and public.is_active_user()
);

create policy storage_invoices_select
on storage.objects for select
using (
  bucket_id = 'invoices'
  and public.is_active_user()
  and (
    public.current_user_role() in ('secretary', 'admin')
    or (storage.foldername(name))[1] in (
      select id::text from public.invoices where uploaded_by = auth.uid()
    )
  )
);

create policy storage_receipts_insert
on storage.objects for insert
with check (
  bucket_id = 'receipts'
  and public.current_user_role() in ('secretary', 'admin')
);

create policy storage_receipts_select
on storage.objects for select
using (
  bucket_id = 'receipts'
  and public.is_active_user()
  and (
    public.current_user_role() in ('secretary', 'admin')
    or (storage.foldername(name))[1] in (
      select id::text from public.invoices where uploaded_by = auth.uid()
    )
  )
);

-- ============================================================================
-- סוף הסכמה.
-- השלב הבא: ליצור ידנית את המשתמש הראשון (admin) - ראה ADMIN_GUIDE.md
-- ============================================================================
