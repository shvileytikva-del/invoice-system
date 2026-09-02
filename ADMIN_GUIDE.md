# מדריך למנהל/ת המערכת

## הוספת משתמש חדש (שיטה זמנית - עד לבניית מסך "ניהול משתמשים" בשלב 2)

כרגע, לפני שנבנה מסך ניהול משתמשים גרפי, הוספת משתמש נעשית כך:

1. בקשי מהמשתמש/ת להיכנס לאתר ולנסות "התחברות עם Google" פעם אחת (יגיעו למסך "אין הרשאה" - זה תקין).
2. ב-Supabase: **Authentication → Users**, מצאי את השורה שלהם לפי כתובת המייל, והעתיקי את ה-**User UID**.
3. ב-**SQL Editor**, הריצי:

```sql
insert into public.users (id, email, name, role, is_active)
values ('הדביקי-UID', 'email@example.com', 'שם מלא', 'school_user', true);
```

החליפי את `'school_user'` ב-`'secretary'` או `'admin'` לפי הצורך.

4. בקשי מהם להתחבר שוב - עכשיו תהיה להם גישה.

## שינוי תפקיד או השבתת משתמש

```sql
-- שינוי תפקיד
update public.users set role = 'secretary' where email = 'email@example.com';

-- השבתת גישה (בלי למחוק היסטוריה)
update public.users set is_active = false where email = 'email@example.com';
```

## הערה
בשלב 2 יתווסף מסך "ניהול משתמשים" בתוך האתר עצמו (זמין רק ל-admin), שיאפשר לבצע את כל הפעולות האלה בלי צורך ב-SQL.
