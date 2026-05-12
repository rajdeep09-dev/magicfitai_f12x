# F12X Studio x Magicfit Client Portal Dashboard

A premium, real-time influencer marketing client portal dashboard for F12X Studio's flagship client, Magicfit. Built with Next.js, Supabase, Framer Motion, and Tailwind CSS.

## Project Status

### Completed ✓
- **Authentication System**: Supabase Auth with email/password, login, signup, and callback routes
- **Database Schema**: Complete PostgreSQL schema with profiles, campaigns, creators, notes, messages, threads, and CSV imports
- **Row Level Security (RLS)**: Full RBAC implementation for client vs. editor roles with automatic profile creation on signup
- **Main Dashboard**: Hero section with animated circular progress ring, 4 KPI cards, approval workflow board, and expandable creator roster
- **Navigation**: Sticky header with role-aware nav, live sync indicator, and user menu
- **Animations**: Staggered page load, hover effects, smooth progress bar fills with Framer Motion
- **Dark Glassmorphic Design**: Premium dark aesthetic (bg-neutral-950) with lime-green (#AEE078) Magicfit brand accents

### In Progress 🔄
- Video approval sections with inline notes and comment threads
- Performance analytics dashboard with charts
- Campaign timeline/Gantt view
- Content calendar with month/week views
- Messaging system with threads

### Planned 📋
- CSV bulk import with template download
- PDF/CSV report generation
- Google Sheets API integration
- Admin user management
- Advanced filtering and search

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Supabase project (connected via environment variables)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Test Accounts

Login with these credentials:

**Client Account:**
- Email: `client@magicfit.com`
- Password: `password123`

**Editor Account:**
- Email: `editor@f12x.com`
- Password: `password123`

## Project Structure

```
app/
├── auth/                    # Authentication pages
│   ├── login/
│   ├── signup/
│   ├── signup-success/
│   ├── error/
│   └── callback/
├── dashboard/              # Protected dashboard pages
│   ├── page.tsx           # Main dashboard with hero section
│   ├── analytics/         # Performance analytics
│   ├── timeline/          # Campaign timeline/Gantt view
│   ├── calendar/          # Content calendar
│   ├── messages/          # Messaging system
│   ├── reports/           # Export and reports
│   └── settings/          # Admin settings (editor only)
├── page.tsx               # Root redirect to auth or dashboard
└── layout.tsx             # Root layout with metadata

components/
├── Header.tsx             # Sticky navigation header with role-aware menu
├── ProgressRing.tsx       # Animated circular progress indicator
├── KPICard.tsx           # KPI metric card component
└── LinearProgress.tsx    # Animated linear progress bar

lib/
├── supabase/
│   ├── client.ts         # Supabase client setup
│   ├── server.ts         # Server-side Supabase client
│   └── proxy.ts          # Session proxy handler
├── mock-data.ts          # Mock creators and campaign data
hooks/
├── useAuth.ts            # Authentication hook with user profile

middleware.ts             # Auth middleware for route protection
```

## Database Schema

### Tables
- **profiles**: User profiles with role (client/editor)
- **campaigns**: Campaign metadata and budget tracking
- **creators**: Creator deliverables and approval status
- **notes**: Comments and revision feedback on creator videos
- **messages**: Two-way messaging between users
- **threads**: Message thread organization
- **csv_imports**: Log of bulk creator imports

All tables have Row Level Security (RLS) enabled with policies enforcing role-based access.

## Key Features

### Role-Based Access Control (RBAC)
- **Clients**: Can view dashboard, approve/request revisions, leave notes
- **Editors**: Full access, can edit creator data, import CSV, manage users

### Dashboard
- **Campaign Progress Ring**: Animated SVG circle showing overall campaign completion
- **KPI Cards**: Total creators, pending approvals, live content, total reach
- **Approval Workflow Board**: Highlights creators awaiting client review
- **Creator Roster**: Expandable table with status badges, progress bars, and video approval sections

### Video Approval System
- Expandable sections under each creator
- Video link display (draft and published)
- Inline notes/comments with author role visibility
- Approval/revision buttons for clients

### Design System
- **Color Palette**: Deep black backgrounds, semi-transparent cards, lime-green accents
- **Typography**: Inter font family, semantic heading hierarchy
- **Animations**: Staggered page load, smooth transitions, glowing effects
- **Responsive**: Mobile-first design with tailored layouts for all screen sizes

## Environment Variables

Required `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

These are automatically set when Supabase integration is connected.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Charts**: Recharts (coming soon)
- **Utilities**: TypeScript, ESLint

## Next Steps

1. Implement video approval system with notes/comments
2. Build analytics dashboard with Recharts
3. Create campaign timeline/Gantt view
4. Build content calendar component
5. Implement messaging system
6. Add CSV bulk import functionality
7. Connect Google Sheets API
8. Deploy to Vercel

## Notes for Development

- Mock data is currently used for creators. Will integrate Supabase queries once backend is ready
- The header component is fully responsive with mobile menu support
- All animations use Framer Motion for smooth, optimized transitions
- RLS policies enforce security; clients can only see their own campaigns

---

**Built with ❤️ by v0 for F12X Studio**
