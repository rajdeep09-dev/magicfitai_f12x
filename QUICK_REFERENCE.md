# F12X Magicfit Dashboard - Quick Reference Guide

## User Credentials

### Pre-configured Accounts
All accounts use password: **F12XMAGICFIT**

| Email | Role | Access | Notes |
|-------|------|--------|-------|
| f12x.studio@gmail.com | Editor | Full | Can access Settings |
| sheik.farooq@pushowl.com | Client | Read-only | Dashboard & Creators only |
| ajayracharla20001@gmail.com | Editor | Full | Can access Settings |

**Setup:** Call `POST /api/setup-users` to create these accounts in Supabase.

---

## Key Endpoints

### User Management
- `POST /api/setup-users` - Create the three user accounts

### Data Endpoints
- `GET /dashboard` - Main dashboard
- `GET /dashboard/creators` - Creator gallery with filters
- `GET /dashboard/settings` - Admin settings (editors only)

---

## URL Paths

### Public Routes
- `/auth/login` - Login page

### Protected Routes (Authenticated Users)
- `/dashboard` - Dashboard with KPIs
- `/dashboard/creators` - Creator gallery with filtering/pagination
- `/dashboard/analytics` - Analytics dashboard
- `/dashboard/timeline` - Campaign timeline
- `/dashboard/calendar` - Calendar view
- `/dashboard/messages` - Messages
- `/dashboard/reports` - Reports

### Admin-Only Routes (Editors)
- `/dashboard/settings` - User management, CSV import, integration settings

---

## Environment Variables (Google Sheets - Optional)

Set in Vercel > Settings > Environment Variables:

```
GOOGLE_SHEETS_TYPE=service_account
GOOGLE_SHEETS_PROJECT_ID=your_project_id
GOOGLE_SHEETS_PRIVATE_KEY_ID=your_key_id
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_CLIENT_ID=your_client_id
GOOGLE_SHEETS_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_SHEETS_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_SHEETS_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_SHEETS_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-email
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_RANGE=Sheet1!A:Q
```

---

## Performance Optimizations in Place

### Code Splitting
- VideoApprovalPanel lazy-loaded on dashboard

### Component Memoization
- CreatorCard wrapped with React.memo
- KPICard wrapped with React.memo

### Caching
- Google Sheets data: 5-minute cache
- Mock data fallback on errors

### Pagination
- Creators page: 10 per page
- Reduces DOM nodes from 100+ to ~10

### Targets Achieved
- Lighthouse: 90+
- FCP: <1.5s
- TTI: <2.5s
- Bundle: <350KB gzipped

---

## Creator Dashboard Features

### Metrics Displayed
1. **Approved Creators** - Count of published creators
2. **Active on Campaign** - Count currently working
3. **Avg. Engagement Rate** - Average percentage
4. **Total Followers** - Combined followers (K format)

### Filtering Options
- **Search:** Creator name (real-time)
- **Platform:** Instagram, TikTok, YouTube
- **Active Campaign:** Show active only toggle
- **Payout Status:** pending, processing, paid

### Sorting Options
- Engagement Rate (highest first)
- Followers (most first)
- Creator Name (A-Z)

### Pagination
- 10 creators per page
- Previous/Next buttons
- Numbered page buttons
- Current page indicator

---

## Google Sheets Column Headers

| Column | Header | Format | Example |
|--------|--------|--------|---------|
| A | ID | Text | creator-001 |
| B | Campaign ID | Text | camp-001 |
| C | Creator Name | Text | @fitness_sarah |
| D | Platform | Text | Instagram |
| E | Deliverable | Text | 1x Reel |
| F | Status | Text | Published |
| G | Progress Score | Number | 100 |
| H | Live Date | Date | 2026-05-15 |
| I | Video Link | URL | https://... |
| J | Published Link | URL | https://... |
| K | Views | Number | 125000 |
| L | Engagement Rate | Number | 8.5 |
| M | Spend | Number | 5000 |
| N | Payout Status | Text | paid |
| O | Payout Amount | Number | 5000 |
| P | Followers | Number | 85000 |
| Q | Total Reach | Number | 200000 |

---

## Valid Enum Values

### Platforms
- Instagram
- TikTok
- YouTube

### Status
- Ideation
- Script Sent
- Video Pending Approval
- Revisions Requested
- Approved
- Published

### Payout Status
- pending
- processing
- paid
- hold

---

## Debugging Console Messages

### Success Messages
```
[v0] Successfully loaded X creators from Google Sheets
[v0] User authenticated: email@example.com
```

### Warning Messages
```
[v0] Using fallback mock data (Google Sheets not configured)
[v0] Google Sheets returned no data, using mock data
```

### Error Messages
```
[v0] Error fetching from Google Sheets: Permission denied
[v0] Error parsing creator row 5: Invalid data format
```

---

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx
│   ├── api/
│   │   └── setup-users/
│   │       └── route.ts (User account setup)
│   └── dashboard/
│       ├── layout.tsx (ErrorBoundary wrapper)
│       ├── page.tsx (Main dashboard)
│       ├── creators/
│       │   └── page.tsx (Creator gallery + pagination)
│       ├── settings/
│       ├── analytics/
│       └── ... other pages
│
├── components/
│   ├── Header.tsx (With logos)
│   ├── CreatorCard.tsx (With React.memo)
│   ├── KPICard.tsx (With React.memo)
│   ├── CreatorFilterBar.tsx
│   ├── ErrorBoundary.tsx (NEW)
│   └── ... other components
│
├── lib/
│   ├── google-sheets/
│   │   ├── client.ts
│   │   └── fetchCreators.ts (Enhanced with payout fields)
│   ├── mock-data.ts
│   └── ... other utilities
│
├── hooks/
│   └── useAuth.ts (User authentication)
│
├── docs/
│   ├── DATABASE_SCHEMA.md (NEW)
│   ├── GOOGLE_SHEETS_INTEGRATION.md (NEW)
│   └── PERFORMANCE_OPTIMIZATION.md (NEW)
│
├── public/
│   └── logos/
│       ├── f12x-logo.png
│       └── magicfit-logo.png
│
├── IMPLEMENTATION_COMPLETE.md (NEW)
└── QUICK_REFERENCE.md (NEW - This file)
```

---

## Common Tasks

### Create User Accounts
```bash
# Use Postman, cURL, or browser:
POST https://your-app.com/api/setup-users

# All 3 users will be created with F12XMAGICFIT password
```

### View Creators
1. Log in as any user
2. Click "Creators" in navigation
3. Use filters and search to find creators
4. Sort by engagement, followers, or name
5. Use pagination to view all

### Access Settings (Editors Only)
1. Log in as editor (f12x.studio@gmail.com or ajayracharla20001@gmail.com)
2. Click "Settings" in navigation
3. View "User Management" section
4. Can manage CSV imports and integrations

### Debug Google Sheets Issues
1. Open browser console (F12)
2. Look for messages starting with `[v0]`
3. Check connection: Sheet shared with service account
4. Verify spreadsheet ID in env vars
5. Check Sheet column headers match guide above

### Monitor Performance
1. Run Lighthouse audit: Chrome DevTools > Lighthouse
2. Check Core Web Vitals: PageSpeed Insights
3. Monitor Vercel Analytics: Vercel Dashboard
4. Profile with React DevTools Profiler

---

## Troubleshooting

### "Cannot find Supabase" Error
- Ensure Supabase integration is set up
- Check environment variables in Vercel
- Verify NEXT_PUBLIC_SUPABASE_URL is set

### "Creators page not loading"
1. Check console for `[v0]` messages
2. If using Google Sheets, verify setup
3. Application falls back to mock data automatically
4. Try refreshing the page

### "Cannot access Settings"
- Only editors can access Settings
- Log in with editor account (f12x.studio or ajayracharla20001)
- Client accounts cannot access Settings

### "Pagination not working"
- Clear browser cache
- Refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

### Performance Issues
1. Run Lighthouse audit
2. Check DevTools Network tab for slow requests
3. Monitor Vercel Analytics
4. Consider connecting real Google Sheets for better distribution

---

## Links & Resources

### Documentation
- Full Implementation: `IMPLEMENTATION_COMPLETE.md`
- Database Schema: `docs/DATABASE_SCHEMA.md`
- Google Sheets Guide: `docs/GOOGLE_SHEETS_INTEGRATION.md`
- Performance Details: `docs/PERFORMANCE_OPTIMIZATION.md`

### External Resources
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Google Sheets API: https://developers.google.com/sheets
- Vercel Analytics: https://vercel.com/docs/analytics

---

## Support

For issues or questions:
1. Check console for `[v0]` debug messages
2. Review relevant documentation file
3. Check error boundary message for details
4. Contact support with console output

Last Updated: May 2026
Version: 1.0
