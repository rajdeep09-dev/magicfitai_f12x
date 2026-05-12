# Role Recognition Resolution - Complete Implementation Guide

## The Issue
The system is not recognizing who is an editor and who is a client. Users cannot be distinguished by their role despite the code being written to support it.

## Root Cause Analysis

### Why This Happens
1. **Schema Not Deployed**: The Supabase database tables don't exist yet - schema.sql hasn't been executed
2. **Users Not Created**: The three user accounts haven't been created - /api/auth/setup hasn't been called
3. **Profile Records Missing**: Even if users exist in auth, their profile records with role data may not exist
4. **RLS Policies Missing**: Database access control policies not in place - rls_policies.sql not executed
5. **Email Mismatch**: Case sensitivity or formatting differences between auth.users.email and profiles.email

### How It Should Work
```
User logs in
    ↓
Supabase Auth validates email/password
    ↓
useAuth() hook gets authenticated user
    ↓
useAuth() queries profiles table for user's role
    ↓
profile.role = 'editor' or 'client'
    ↓
Components check isEditor = profile?.role === 'editor'
    ↓
UI conditionally shows editor features (Settings menu, etc.)
```

## Complete Resolution Steps

### STEP 1: Deploy Database Schema to Supabase

**Location**: Supabase Dashboard > SQL Editor > New Query

**Execute in this exact order:**

#### Query 1 - Base Schema
File: `/supabase/schema.sql`
- Creates: profiles, campaigns, creators, payouts, creator_engagements, bulk_imports tables
- Adds constraints, defaults, and relationships
- Takes: ~2 seconds

#### Query 2 - RLS Policies
File: `/supabase/rls_policies.sql`
- Enables Row-Level Security on all tables
- Adds role-based access control policies
- Prevents editors from seeing client data and vice versa
- Takes: ~3 seconds

#### Query 3 - Profile Table Fixes
File: `/supabase/migration_fix_profiles_table.sql`
- Adds missing columns (is_active, email_verified)
- Creates performance indexes
- Adds trigger for automatic timestamp updates
- Creates helper function for role lookups
- Takes: ~1 second

**Status after Step 1**: Database schema ready, but no data yet

### STEP 2: Create User Accounts

**Method A: Via API Endpoint (Recommended)**

Make a POST request to your application:
```
POST /api/auth/setup
```

This single request will:
- Create auth user for f12x.studio@gmail.com with role 'editor'
- Create auth user for sheik.farooq@pushowl.com with role 'client'
- Create auth user for ajayracharla20001@gmail.com with role 'editor'
- Create corresponding profile records with roles
- Return success/error status

**Expected Success Response:**
```json
{
  "success": true,
  "results": [
    { "email": "f12x.studio@gmail.com", "status": "success", "role": "editor" },
    { "email": "sheik.farooq@pushowl.com", "status": "success", "role": "client" },
    { "email": "ajayracharla20001@gmail.com", "status": "success", "role": "editor" }
  ]
}
```

**Method B: Manual Supabase Dashboard**

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Email: f12x.studio@gmail.com
4. Password: F12XMAGICFIT
5. Click "Create user"
6. Repeat for other two emails
7. Then manually insert into profiles table with correct roles

**Status after Step 2**: Users exist in auth system, profiles created with roles

### STEP 3: Verify Role Recognition Works

**Test Case 1: Editor Login**
```
1. Go to /auth/login
2. Email: f12x.studio@gmail.com
3. Password: F12XMAGICFIT
4. Click Login
5. Check Header - should show "👨‍💼 Editor"
6. Check navigation - Settings link should appear
7. Navigate to /dashboard/settings - should work
```

**Test Case 2: Client Login**
```
1. Go to /auth/login
2. Email: sheik.farooq@pushowl.com
3. Password: F12XMAGICFIT
4. Click Login
5. Check Header - should show "👤 Client"
6. Check navigation - Settings link should NOT appear
7. Try /dashboard/settings - should be blocked by RLS
```

**Success Indicators:**
- ✅ Header shows correct role badge
- ✅ Settings menu appears only for editors
- ✅ Client can view creators gallery
- ✅ Editor can approve/reject creators
- ✅ No console errors

### STEP 4: If Role Recognition Still Doesn't Work

**Diagnostic Checklist:**

1. **Verify Supabase Connection**
   - Check environment variables are set
   - NEXT_PUBLIC_SUPABASE_URL = https://perzvdtfzddyhnnuovnq.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_e1I5Y1RJlPwr_aalqtojpw_YCwzxsLw

2. **Check Database Tables**
   - Go to Supabase > Table Editor
   - Verify profiles table exists
   - Verify 3 rows exist with correct roles
   - Verify email values match exactly (case-sensitive!)

3. **Check Auth Users**
   - Go to Supabase > Authentication > Users
   - Verify 3 users created
   - Verify email_confirmed_at is set (not NULL)
   - Note the user IDs (UUIDs)

4. **Verify Profile-Auth Link**
   - User ID in profiles table must exactly match auth.users.id
   - Email in profiles must exactly match auth.users.email
   - Query: `SELECT id, email, role FROM profiles`

5. **Test RLS Policy**
   - Go to Supabase > Authentication > Policies
   - Find profiles table policies
   - Click "Test" button
   - Use your user ID as test value
   - Verify policy allows SELECT

6. **Check Browser Console (F12)**
   - Look for errors in Console tab
   - Check Network tab for failed API calls
   - Look for "Error fetching profile" messages

7. **Clear Browser Cache**
   - Clear all cookies for your domain
   - Clear localStorage
   - Close and reopen browser
   - Try login again

## Code Architecture

### Key Files Involved

**Authentication Flow:**
- `/app/auth/login/page.tsx` - Login form (uses Supabase auth)
- `/hooks/useAuth.ts` - Fetches user and profile data
- `/app/api/auth/setup/route.ts` - Creates users and profiles

**Role-Based UI:**
- `/components/Header.tsx` - Shows Settings link based on isEditor
- `/components/VideoApprovalPanel.tsx` - Shows approval buttons based on role
- `/app/dashboard/settings/page.tsx` - Only for editors (RLS enforces)

**Database:**
- `/supabase/schema.sql` - Creates profiles table
- `/supabase/rls_policies.sql` - Controls access by role
- `/supabase/migration_fix_profiles_table.sql` - Fixes and optimizes profiles

**Role Checking Logic:**
```typescript
// In useAuth.ts - Fetches role from database
const { data: profileData } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

setProfile(profileData); // profileData.role = 'editor'

// In Header.tsx - Uses role to show/hide features
const { profile } = useAuth();
const isEditor = profile?.role === 'editor' || profile?.role === 'admin';

{isEditor && <SettingsLink />} // Conditional render
```

## Environment Variables Needed

```
# Required for frontend
NEXT_PUBLIC_SUPABASE_URL=https://perzvdtfzddyhnnuovnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_e1I5Y1RJlPwr_aalqtojpw_YCwzxsLw

# Required for /api/auth/setup (server-side)
SUPABASE_SERVICE_ROLE_KEY=[Your service role key from Supabase]
```

## Files to Review

- **Role Recognition Flow:** `/docs/ROLE_RECOGNITION_FLOW.md` - Visual diagrams
- **Detailed Setup Guide:** `/docs/ROLE_RECOGNITION_FIX.md` - Step-by-step instructions
- **Quick Reference:** `/ROLE_RECOGNITION_QUICK_FIX.md` - Checklist format

## Validation Queries

Run these in Supabase SQL Editor to verify everything:

```sql
-- Check profiles table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Check created users and profiles
SELECT p.id, p.email, p.role, p.is_active 
FROM profiles p 
ORDER BY p.created_at DESC;

-- Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'profiles';
```

## Timeline to Full Resolution

- **Step 1 (Deploy Schema):** 2 minutes
- **Step 2 (Create Users):** 1 minute
- **Step 3 (Verify):** 2 minutes
- **Step 4 (Troubleshoot if needed):** 5-10 minutes

**Total: 5-10 minutes to full resolution**

## Success Confirmation

Once implemented, you should be able to:
1. ✅ Log in with editor email and see Settings in menu
2. ✅ Log in with client email and Settings is hidden
3. ✅ Editors can manage all creators
4. ✅ Clients see only approved content
5. ✅ Header shows correct role badge for each user
6. ✅ No console errors about missing role data
