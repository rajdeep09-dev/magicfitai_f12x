# Role Recognition - Quick Fix Checklist

## Execute These Steps Immediately

### 1. Deploy SQL to Supabase (3 parts - in order)

**Go to:** Supabase Dashboard > SQL Editor > New Query

**Part A - Copy & Paste:**
```
File: /supabase/schema.sql
Execute in Supabase
```

**Part B - Copy & Paste:**
```
File: /supabase/rls_policies.sql
Execute in Supabase
```

**Part C - Copy & Paste:**
```
File: /supabase/migration_fix_profiles_table.sql
Execute in Supabase
```

### 2. Create Users

**Make HTTP POST Request:**
```
URL: https://[your-app-url]/api/auth/setup
Method: POST
Expected: { "success": true, "results": [...] }
```

OR in terminal:
```bash
curl -X POST https://[your-app-url]/api/auth/setup
```

### 3. Test Role Recognition

**Test Editor:**
- Email: f12x.studio@gmail.com
- Password: F12XMAGICFIT
- Expected: Header shows "👨‍💼 Editor", Settings visible

**Test Client:**
- Email: sheik.farooq@pushowl.com
- Password: F12XMAGICFIT
- Expected: Header shows "👤 Client", Settings hidden

## If Still Not Working

1. **Check Supabase Tables:**
   - Go to Supabase > Table Editor
   - Verify `profiles` table has 3 records
   - Verify each has `role` set correctly

2. **Check RLS Policies:**
   - Go to Supabase > Authentication > Policies
   - Verify policies exist for each table
   - Test policy with "Test" button

3. **Check Browser Console:**
   - Press F12 in browser
   - Look for errors in Console tab
   - Check Network tab for API failures

4. **Verify Environment Variables:**
   - NEXT_PUBLIC_SUPABASE_URL set
   - NEXT_PUBLIC_SUPABASE_ANON_KEY set
   - SUPABASE_SERVICE_ROLE_KEY set (for /api/auth/setup)

## Files to Reference

- Full guide: `/docs/ROLE_RECOGNITION_FIX.md`
- useAuth hook: `/hooks/useAuth.ts`
- Auth setup API: `/app/api/auth/setup/route.ts`
- Header component: `/components/Header.tsx`
