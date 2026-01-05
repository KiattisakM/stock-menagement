# Implementation Plan: Phase 1 - Project Setup

**Plan ID:** phase1-setup-001
**Created:** 2026-01-05
**Target Phase:** Phase 1 - Initial Setup (Week 1-2)
**Estimated Duration:** 2-3 hours
**Status:** Ready for Execution

---

## 📋 Plan Overview

This plan covers the complete setup of the Stock Management System foundation, including:
- Next.js 16 project initialization with TypeScript and Tailwind CSS v4
- Prisma ORM setup with PostgreSQL database schema
- shadcn/ui component library installation and configuration
- Basic authentication system
- Dashboard layout with navigation
- Environment configuration

**Success Criteria:**
- ✅ `npm run dev` starts without errors
- ✅ Database connected with all migrations applied
- ✅ shadcn/ui components installed and themed
- ✅ TypeScript compiles with zero errors (strict mode)
- ✅ Dashboard accessible with sidebar navigation

---

## 🎯 Prerequisites

### Required Software
- [x] Node.js 18.18+ (verify: `node --version`)
- [x] npm/pnpm (verify: `npm --version`)
- [ ] PostgreSQL 14+ running locally or accessible remotely
- [ ] Git (verify: `git --version`)

### Required Accounts/Tokens
- [ ] PostgreSQL database credentials
- [ ] (Optional) LINE Notify token for alerts

### Knowledge Requirements
- Understanding of Next.js 16 App Router
- Basic TypeScript knowledge
- Prisma schema syntax
- Tailwind CSS basics

---

## 📦 Implementation Steps

### Step 1: Initialize Next.js 16 Project

**Priority:** Critical
**Dependencies:** None
**Estimated Time:** 5 minutes

**Actions:**
```bash
# Initialize Next.js 16 with TypeScript, Tailwind, App Router
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Configuration Options:**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ App Router: Yes
- ❌ src/ directory: No
- ✅ Import alias: `@/*`

**Validation:**
```bash
# Check if Next.js initialized correctly
npm run dev
# Should start on http://localhost:3000
```

**Expected Files Created:**
- `package.json` with Next.js 16 dependencies
- `tsconfig.json` with TypeScript config
- `next.config.ts`
- `tailwind.config.ts`
- `app/` directory with layout.tsx and page.tsx
- `app/globals.css`

---

### Step 2: Install Core Dependencies

**Priority:** Critical
**Dependencies:** Step 1 complete
**Estimated Time:** 3 minutes

**Actions:**
```bash
# Install production dependencies
npm install @prisma/client @react-pdf/renderer react-hook-form zod @hookform/resolvers @tanstack/react-query exceljs node-cron bcrypt

# Install development dependencies
npm install -D prisma @types/node-cron @types/bcrypt
```

**Dependency Breakdown:**

**Database & ORM:**
- `@prisma/client` - Prisma Client for database access
- `prisma` (dev) - Prisma CLI

**Forms & Validation:**
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - React Hook Form + Zod integration

**Data Fetching:**
- `@tanstack/react-query` - Server state management and polling

**Document Generation:**
- `@react-pdf/renderer` - PDF generation with React
- `exceljs` - Excel export/import

**Utilities:**
- `node-cron` - Scheduled tasks
- `@types/node-cron` (dev) - TypeScript types for node-cron
- `bcrypt` - Password hashing
- `@types/bcrypt` (dev) - TypeScript types for bcrypt

**Validation:**
```bash
# Check package.json
cat package.json | grep -E "@prisma|react-hook-form|zod|react-query"
```

---

### Step 3: Configure Tailwind CSS v4

**Priority:** High
**Dependencies:** Step 1 complete
**Estimated Time:** 5 minutes

**Actions:**

1. **Update `app/globals.css` with CSS-first configuration:**

```css
@import "tailwindcss";

/* Thai Font Import */
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

@theme {
  /* Typography */
  --font-family-sans: 'Sarabun', 'Inter', system-ui, -apple-system, sans-serif;

  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
}

/* Base Styles */
body {
  font-family: var(--font-family-sans);
}
```

2. **Verify Tailwind Config:**
Check that `tailwind.config.ts` exists and has proper setup.

**Validation:**
```bash
# Start dev server and check if Tailwind classes work
npm run dev
# Visit localhost:3000 and inspect styles
```

---

### Step 4: Setup Prisma and Database Schema

**Priority:** Critical
**Dependencies:** Step 2 complete, PostgreSQL running
**Estimated Time:** 15 minutes

**Actions:**

1. **Initialize Prisma:**
```bash
npx prisma init
```

2. **Create `.env` file with database connection:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stock_management?schema=public"

# Next.js
NEXT_PUBLIC_URL="http://localhost:3000"

# LINE Notify (optional for now)
LINE_NOTIFY_TOKEN=""
```

3. **Create `prisma/schema.prisma`:**

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Materials (วัสดุ)
model Material {
  id              Int        @id @default(autoincrement())
  name            String     @db.VarChar(100)
  unit            String     @db.VarChar(20)
  current_stock   Decimal    @default(0) @db.Decimal(10, 2)
  min_stock_alert Decimal?   @db.Decimal(10, 2)
  created_at      DateTime   @default(now())

  stock_in        StockIn[]
  stock_out       StockOut[]
  trips           Trip[]

  @@map("materials")
}

// Stock In (บันทึกสต็อกเข้า)
model StockIn {
  id               Int      @id @default(autoincrement())
  material_id      Int
  quantity         Decimal  @db.Decimal(10, 2)
  unit_price       Decimal? @db.Decimal(10, 2)
  supplier         String?  @db.VarChar(200)
  note             String?  @db.Text
  transaction_date DateTime
  created_at       DateTime @default(now())

  material         Material @relation(fields: [material_id], references: [id])

  @@index([material_id])
  @@index([transaction_date])
  @@map("stock_in")
}

// Stock Out (บันทึกสต็อกออก)
model StockOut {
  id               Int      @id @default(autoincrement())
  material_id      Int
  quantity         Decimal  @db.Decimal(10, 2)
  customer_name    String?  @db.VarChar(200)
  project_name     String?  @db.VarChar(200)
  note             String?  @db.Text
  transaction_date DateTime
  created_at       DateTime @default(now())

  material         Material @relation(fields: [material_id], references: [id])

  @@index([material_id])
  @@index([transaction_date])
  @@map("stock_out")
}

// Employees (พนักงาน)
model Employee {
  id             Int      @id @default(autoincrement())
  name           String   @db.VarChar(100)
  truck_license  String?  @db.VarChar(50)
  base_salary    Decimal  @default(0) @db.Decimal(10, 2)
  rate_per_trip  Decimal  @db.Decimal(10, 2)
  status         Status   @default(active)
  created_at     DateTime @default(now())

  trips          Trip[]
  advances       Advance[]
  salary_summaries SalarySummary[]

  @@map("employees")
}

enum Status {
  active
  inactive
}

// Trips (บันทึกการวิ่งงาน)
model Trip {
  id          Int      @id @default(autoincrement())
  employee_id Int
  trip_date   DateTime @db.Date
  route       String?  @db.VarChar(200)
  material_id Int?
  quantity    Decimal? @db.Decimal(10, 2)
  rate        Decimal  @db.Decimal(10, 2)
  note        String?  @db.Text
  created_at  DateTime @default(now())

  employee    Employee  @relation(fields: [employee_id], references: [id])
  material    Material? @relation(fields: [material_id], references: [id])

  @@index([employee_id])
  @@index([trip_date])
  @@map("trips")
}

// Advances (เบิกเงินล่วงหน้า)
model Advance {
  id           Int      @id @default(autoincrement())
  employee_id  Int
  amount       Decimal  @db.Decimal(10, 2)
  advance_date DateTime @db.Date
  note         String?  @db.Text
  created_at   DateTime @default(now())

  employee     Employee @relation(fields: [employee_id], references: [id])

  @@index([employee_id])
  @@index([advance_date])
  @@map("advances")
}

// Salary Summaries (สรุปเงินเดือนรายเดือน)
model SalarySummary {
  id                Int      @id @default(autoincrement())
  employee_id       Int
  month             Int
  year              Int
  total_trips       Int      @default(0)
  total_trip_income Decimal  @default(0) @db.Decimal(10, 2)
  total_advances    Decimal  @default(0) @db.Decimal(10, 2)
  base_salary       Decimal  @default(0) @db.Decimal(10, 2)
  net_salary        Decimal  @default(0) @db.Decimal(10, 2)
  is_paid           Boolean  @default(false)
  paid_date         DateTime? @db.Date
  created_at        DateTime @default(now())

  employee          Employee @relation(fields: [employee_id], references: [id])

  @@unique([employee_id, month, year])
  @@index([month, year])
  @@map("salary_summaries")
}

// Users (สำหรับ Authentication)
model User {
  id         Int      @id @default(autoincrement())
  email      String   @unique @db.VarChar(100)
  password   String   @db.VarChar(255)
  name       String   @db.VarChar(100)
  role       String   @default("admin") @db.VarChar(20)
  created_at DateTime @default(now())

  @@map("users")
}
```

4. **Run Prisma Migration:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Create Prisma Client Singleton (`lib/prisma.ts`):**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

6. **Create `.env.example`:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stock_management"

# Next.js
NEXT_PUBLIC_URL="http://localhost:3000"

# LINE Notify (get token from https://notify-bot.line.me/)
LINE_NOTIFY_TOKEN=""
```

**Validation:**
```bash
# Check if migration succeeded
npx prisma studio
# Should open Prisma Studio with all tables

# Check if Prisma Client generated
ls -la node_modules/.prisma/client/
```

**Seed Database with Initial Data (Optional):**

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'admin',
    },
  });

  // Create initial materials
  await prisma.material.createMany({
    data: [
      {
        name: 'หินฝุ่น',
        unit: 'ตัน',
        current_stock: 0,
        min_stock_alert: 10,
      },
      {
        name: 'ทรายหยาบ',
        unit: 'คิว',
        current_stock: 0,
        min_stock_alert: 5,
      },
      {
        name: 'ดินถม',
        unit: 'ตัน',
        current_stock: 0,
        min_stock_alert: 8,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Run seed:
```bash
npm install -D tsx
npx prisma db seed
```

---

### Step 5: Setup shadcn/ui

**Priority:** High
**Dependencies:** Step 1 complete
**Estimated Time:** 10 minutes

**Actions:**

1. **Initialize shadcn/ui:**
```bash
npx shadcn@latest init
```

**Configuration:**
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Import alias: `@/components`

2. **Install Required Components:**
```bash
npx shadcn@latest add button input select table form card badge alert tabs sheet dialog calendar
```

Additional components:
```bash
npx shadcn@latest add dropdown-menu label separator toast checkbox textarea
```

3. **Verify Installation:**
Check that `components/ui/` directory exists with all components.

**Validation:**
```bash
# Check installed components
ls -la components/ui/
# Should see: button.tsx, input.tsx, select.tsx, table.tsx, etc.
```

---

### Step 6: Create Project Directory Structure

**Priority:** High
**Dependencies:** Step 1 complete
**Estimated Time:** 5 minutes

**Actions:**

Create all necessary directories:
```bash
# Create app directory structure
mkdir -p app/\(auth\)/login
mkdir -p app/\(dashboard\)/dashboard
mkdir -p app/\(dashboard\)/stock/in
mkdir -p app/\(dashboard\)/stock/out
mkdir -p app/\(dashboard\)/stock/history
mkdir -p app/\(dashboard\)/employees/trips
mkdir -p app/\(dashboard\)/employees/salary
mkdir -p app/api/stock
mkdir -p app/api/employees
mkdir -p app/api/auth
mkdir -p app/api/cron/stock-alert

# Create components directory structure
mkdir -p components/forms
mkdir -p components/tables
mkdir -p components/pdf
mkdir -p components/dashboard

# Create lib directory structure
mkdir -p lib/validations

# Create public directory
mkdir -p public/images
```

**Expected Structure:**
```
app/
├── (auth)/
│   ├── login/
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   ├── stock/
│   ├── employees/
│   └── layout.tsx
├── api/
│   ├── stock/
│   ├── employees/
│   ├── auth/
│   └── cron/
├── layout.tsx
├── page.tsx
└── globals.css

components/
├── ui/           # shadcn/ui
├── forms/
├── tables/
├── pdf/
└── dashboard/

lib/
├── prisma.ts
├── utils.ts
└── validations/
```

---

### Step 7: Create Root Layout and Theme

**Priority:** High
**Dependencies:** Step 3, Step 5 complete
**Estimated Time:** 10 minutes

**Actions:**

1. **Update `app/layout.tsx`:**

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'ระบบจัดการสต็อกวัสดุก่อสร้าง',
  description: 'ระบบจัดการสต็อกวัสดุก่อสร้างและเงินเดือนพนักงาน',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

2. **Create `lib/utils.ts`:**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

3. **Install missing dependencies:**
```bash
npm install clsx tailwind-merge
```

---

### Step 8: Create Authentication System

**Priority:** High
**Dependencies:** Step 4 complete (Prisma)
**Estimated Time:** 20 minutes

**Actions:**

1. **Create `lib/auth.ts`:**

```typescript
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  // Don't return password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

2. **Create Auth Layout `app/(auth)/layout.tsx`:**

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

3. **Create Login Page `app/(auth)/login/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
        <CardDescription className="text-center">
          ระบบจัดการสต็อกวัสดุก่อสร้าง
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

4. **Create Login API Route `app/api/auth/login/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // In production, you'd set a session cookie here
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
```

---

### Step 9: Create Dashboard Layout with Sidebar

**Priority:** High
**Dependencies:** Step 5 complete (shadcn/ui)
**Estimated Time:** 25 minutes

**Actions:**

1. **Create Dashboard Layout `app/(dashboard)/layout.tsx`:**

```typescript
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}
```

2. **Create Sidebar Component `components/dashboard/sidebar.tsx`:**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'จัดการสต็อก',
    icon: Package,
    children: [
      { name: 'บันทึกสต็อกเข้า', href: '/stock/in' },
      { name: 'บันทึกสต็อกออก', href: '/stock/out' },
      { name: 'ประวัติสต็อก', href: '/stock/history' },
    ]
  },
  {
    name: 'จัดการพนักงาน',
    icon: Users,
    children: [
      { name: 'บันทึกการวิ่งงาน', href: '/employees/trips' },
      { name: 'คำนวณเงินเดือน', href: '/employees/salary' },
    ]
  },
  { name: 'รายงาน', href: '/reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">ระบบจัดการสต็อก</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800',
                  pathname === item.href ? 'bg-gray-800' : ''
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.children && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm hover:bg-gray-800',
                          pathname === child.href ? 'bg-gray-800' : ''
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-800">
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
```

3. **Create Dashboard Page `app/(dashboard)/dashboard/page.tsx`:**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">ภาพรวมระบบจัดการสต็อก</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">สต็อกทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">พนักงาน</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">เที่ยววันนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">เที่ยว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">แจ้งเตือนสต็อก</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>ยินดีต้อนรับสู่ระบบจัดการสต็อก</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            ระบบพร้อมใช้งาน เริ่มต้นโดยการเพิ่มข้อมูลวัสดุและพนักงาน
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

4. **Install missing icon library:**
```bash
npm install lucide-react
```

---

### Step 10: Update TypeScript Configuration

**Priority:** Medium
**Dependencies:** Step 1 complete
**Estimated Time:** 3 minutes

**Actions:**

1. **Update `tsconfig.json` for strict mode:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

2. **Validation:**
```bash
npx tsc --noEmit
# Should complete with no errors
```

---

### Step 11: Create Home Page Redirect

**Priority:** Low
**Dependencies:** Step 8 complete
**Estimated Time:** 2 minutes

**Actions:**

1. **Update `app/page.tsx`:**

```typescript
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
```

---

### Step 12: Setup Git and Initial Commit

**Priority:** Low
**Dependencies:** All previous steps
**Estimated Time:** 5 minutes

**Actions:**

1. **Update `.gitignore`:**

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/migrations/
```

2. **Initialize Git (if not already):**
```bash
git init
git add .
git commit -m "Initial setup: Next.js 16 + Prisma + shadcn/ui + Dashboard"
```

---

## ✅ Validation Checklist

After completing all steps, verify:

- [ ] `npm run dev` starts without errors on http://localhost:3000
- [ ] TypeScript compiles: `npx tsc --noEmit` (no errors)
- [ ] Database connected: `npx prisma studio` opens successfully
- [ ] All migrations applied: Check Prisma Studio shows all tables
- [ ] Login page accessible at `/login`
- [ ] Dashboard accessible at `/dashboard` with sidebar
- [ ] shadcn/ui components render correctly
- [ ] Tailwind CSS classes working (check dashboard styling)
- [ ] Thai fonts displaying correctly
- [ ] No console errors in browser

---

## 🔧 Troubleshooting

### Issue: Database connection fails
**Solution:**
- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb stock_management`

### Issue: Prisma Client not found
**Solution:**
```bash
npx prisma generate
```

### Issue: shadcn/ui components not found
**Solution:**
```bash
npx shadcn@latest add [component-name]
```

### Issue: TypeScript errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npx tsc --noEmit
```

### Issue: Tailwind classes not working
**Solution:**
- Check `globals.css` has `@import "tailwindcss"`
- Restart dev server
- Clear browser cache

---

## 📊 Progress Tracking

**Completion Status:**
- [ ] Step 1: Initialize Next.js 16 Project
- [ ] Step 2: Install Core Dependencies
- [ ] Step 3: Configure Tailwind CSS v4
- [ ] Step 4: Setup Prisma and Database Schema
- [ ] Step 5: Setup shadcn/ui
- [ ] Step 6: Create Project Directory Structure
- [ ] Step 7: Create Root Layout and Theme
- [ ] Step 8: Create Authentication System
- [ ] Step 9: Create Dashboard Layout with Sidebar
- [ ] Step 10: Update TypeScript Configuration
- [ ] Step 11: Create Home Page Redirect
- [ ] Step 12: Setup Git and Initial Commit

---

## 🎯 Next Steps (Post-Setup)

After Phase 1 completion, proceed to:

**Phase 2: Stock Management**
- Implement Materials CRUD
- Create Stock In form and API
- Create Stock Out form and API
- Build Stock History table

**Phase 3: Employee & Payroll**
- Implement Employee CRUD
- Create Trip recording system
- Build Salary calculation logic

---

## 📝 Notes

- **Estimated Total Time:** 2-3 hours
- **Complexity:** Medium
- **Dependencies:** PostgreSQL must be running
- **Blocking Issues:** None identified

**Plan Status:** ✅ Ready for Execution with `gogogo`

---

**Plan Created By:** Claude Code
**Version:** 1.0
**Last Updated:** 2026-01-05
