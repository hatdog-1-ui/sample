# Lab Inventory & Software License Tracking System

A mobile-responsive web application for tracking computer lab inventory and software licenses. Built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Dashboard** — Overview of all computers, license seat usage, and expiring/expired license alerts
- **Computers** — View, filter, add, and delete lab computers with specs and status
- **Software Licenses** — Track paid and free software, seat usage (total - installed = remaining), and expiration dates
- **Installations** — Assign software licenses to specific computers, with duplicate prevention
- **Mobile-Responsive** — Card layout on mobile, table layout on desktop

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and choose a name and password
3. Wait for the project to be provisioned

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql` and run it — this creates the tables, indexes, view, and RLS policies
3. Copy the contents of `supabase/seed.sql` and run it — this loads the initial lab data from the spreadsheet

### 3. Get Your API Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy the **Project URL** and **anon/public** key

### 4. Configure the Frontend

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `computers` | Lab computers with name, location, status, OS, specs |
| `software_licenses` | Software with license type, seats, expiry, vendor info |
| `installations` | Links computers to licenses (many-to-many) |

### View

| View | Description |
|------|-------------|
| `license_seat_usage` | Calculates used and remaining seats per license |

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Deployment**: Static export ready (`next build` generates static files)
