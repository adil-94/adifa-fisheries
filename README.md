# 🐟 Adifa Fisheries - Expense Tracking System

A secure, production-ready expense tracking application for two business partners with strict ownership controls.

## 🎯 Features

- **Secure Authentication**: Email/password login via Supabase Auth
- **Row Level Security (RLS)**: Database-enforced ownership controls
- **Partner Dashboard**: View combined expenses with summary cards
- **Partner Tabs**: Each partner can only edit their own expenses
- **Date Filtering**: Filter expenses by date range
- **Responsive Design**: Works on mobile and desktop
- **Modern UI**: Built with DaisyUI components and Tailwind CSS

## 👥 Authorized Users

| Partner | Email |
|---------|-------|
| Adil | adil143420@gmail.com |
| Aejaz | aejazfishkcp@gmail.com |

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, DaisyUI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel

---

## 📦 Project Structure

```
adifa-fisheries/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── ExpenseTable.tsx
│   │   ├── ExpenseModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── DateFilter.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── EmptyState.tsx
│   ├── context/          # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useExpenses.ts
│   ├── lib/              # External service clients
│   │   └── supabase.ts
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ExpensesPage.tsx
│   ├── types/            # TypeScript types
│   │   ├── database.ts
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── format.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql        # Database schema + RLS policies
├── .env.example
├── vercel.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Project Settings** → **API** and copy:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key

### Step 2: Run Database Schema

1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute

This creates:
- `expenses` table with proper columns
- Indexes for performance
- RLS policies for security
- Auto-update trigger for `updated_at`

### Step 3: Create User Accounts

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Create both users:

   **User 1:**
   - Email: `adil143420@gmail.com`
   - Password: (set a secure password)
   - Auto Confirm User: ✅ Enabled

   **User 2:**
   - Email: `aejazfishkcp@gmail.com`
   - Password: (set a secure password)
   - Auto Confirm User: ✅ Enabled

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Install Dependencies & Run Locally

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 Deploy to Vercel

### Option 1: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## 🔐 Security: Row Level Security (RLS)

| Operation | Policy |
|-----------|--------|
| **SELECT** | All authenticated users can view all expenses |
| **INSERT** | Only if `auth.uid() = user_id` |
| **UPDATE** | Only if `auth.uid() = user_id` |
| **DELETE** | Only if `auth.uid() = user_id` |

---

## 🔧 Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

---

## 📄 License

Private - Adifa Fisheries
