# מעקב חשבוניות - מדריך הקמה

מדריך שלב-אחר-שלב להקמת המערכת מאפס. לא נדרש ידע טכני מעמיק — עקבו אחרי הצעדים בסדר.

## שלב 1: יצירת פרויקט Supabase (בסיס הנתונים)

1. גשו ל-https://supabase.com והרשמו (אפשר עם חשבון Google).
2. לחצו על **New Project**.
3. בחרו שם לפרויקט (למשל `invoice-system`), וסיסמת מסד נתונים (שמרו אותה במקום בטוח - לא תצטרכו אותה בשימוש שוטף).
4. בחרו אזור (Region) קרוב — למשל `eu-central-1` (פרנקפורט).
5. המתינו כ-2 דקות עד שהפרויקט מוכן.

## שלב 2: הרצת סכמת בסיס הנתונים

1. בתפריט הצד של Supabase, לחצו על **SQL Editor**.
2. לחצו **New query**.
3. פתחו את הקובץ `supabase/schema.sql` מתוך התיקייה הזו, העתיקו את **כל** התוכן, והדביקו בעורך.
4. לחצו **Run**. אמור להופיע "Success. No rows returned".

> אם קיבלתם שגיאה — עצרו ושלחו לי את הודעת השגיאה המדויקת, אני אתקן.

## שלב 3: הגדרת כניסה עם Google (OAuth)

1. ב-Supabase: **Authentication** → **Providers** → **Google** → הפעילו (Enable).
2. תצטרכו Client ID + Client Secret מגוגל:
   - גשו ל-https://console.cloud.google.com/apis/credentials
   - צרו פרויקט חדש (או השתמשו בקיים).
   - **Create Credentials** → **OAuth client ID** → סוג: **Web application**.
   - תחת **Authorized redirect URIs** הוסיפו את הכתובת שמופיעה ב-Supabase בעמוד ה-Google provider (נראית כך: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
   - העתיקו את ה-Client ID וה-Client Secret חזרה לעמוד ה-Google provider ב-Supabase, ושמרו.
3. **חשוב**: אין דרך פשוטה להגביל כניסה רק לשני הדומיינים שלכם ברמת Google עצמו כשמדובר בשני דומיינים שונים — לכן ההגנה במערכת שלנו היא בשכבה הבאה: **רק מי שיש לו שורה בטבלת `users` (עם `is_active = true`) יכול להיכנס בפועל** (ראה ADMIN_GUIDE.md). כל אחד אחר שינסה להתחבר עם Google יראה מסך "אין הרשאה".

## שלב 4: יצירת המשתמש הראשון (Admin - את/ה)

בצעו את זה **אחרי** שהאתר כבר רץ (ראה שלב 6), כי צריך שתתחברי פעם אחת כדי שהמערכת תזהה את חשבון הגוגל שלך.

1. היכנסי לאתר ולחצי "התחברות עם Google", התחברי עם חשבון הגוגל שאיתו תנהלי את המערכת.
2. תגיעי למסך "אין הרשאה" — זה תקין, כך צריך להיות בפעם הראשונה.
3. ב-Supabase: **Authentication** → **Users** — תמצאי שם את עצמך ברשימה, והעתיקי את ה-**User UID** שלך.
4. ב-**SQL Editor**, הריצי (עם ה-UID וה-Email שלך):

```sql
insert into public.users (id, email, name, role, is_active)
values ('הדביקי-כאן-את-ה-UID', 'your-email@example.com', 'השם שלך', 'admin', true);
```

5. חזרי לאתר, התנתקי והתחברי מחדש — עכשיו את/ה admin עם גישה מלאה.

מכאן והלאה, את/ה יכול/ה להוסיף משתמשים נוספים ישירות דרך מסך "ניהול משתמשים" באתר (ולא דרך SQL) — ראה ADMIN_GUIDE.md.

## שלב 5: הרצה מקומית (לבדיקה במחשב שלכם)

דרוש: [Node.js](https://nodejs.org) גרסה 18 ומעלה מותקן במחשב.

1. פתחו טרמינל בתוך תיקיית הפרויקט.
2. הריצו: `npm install`
3. העתיקו את `.env.example` לקובץ בשם `.env.local`, ומלאו את הערכים (מ-Supabase: **Settings → API**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. הריצו: `npm run dev`
5. פתחו בדפדפן: http://localhost:3000

## שלב 6: פריסה לאינטרנט (Vercel)

1. העלו את קוד הפרויקט ל-GitHub (repository חדש).
2. גשו ל-https://vercel.com, התחברו עם GitHub, ולחצו **Add New Project**.
3. בחרו את ה-repository שיצרתם.
4. במסך ההגדרות, תחת **Environment Variables**, הוסיפו את שלושת המשתנים מהקובץ `.env.local` (אותם ערכים בדיוק).
5. לחצו **Deploy**. אחרי כ-2 דקות תקבלו כתובת אתר חיה (למשל `invoice-system.vercel.app`).
6. **חשוב**: חזרו לעמוד ה-Google provider ב-Supabase Auth, והוסיפו גם את כתובת ה-Vercel כ-Redirect URL מורשה (וגם ב-Google Cloud Console, שלב 3).

---

בכל שלב שנתקעים — אפשר להעתיק את הודעת השגיאה המדויקת ולשלוח לי, ואני אעזור לפתור.
