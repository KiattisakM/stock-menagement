# Session Context: Stock Management System

**Session Created:** 2026-01-05
**Project Phase:** Phase 1 - Initial Setup (Week 1-2)
**Status:** Documentation Complete, Ready for Implementation

---

## Project Overview

**Stock Management System** - A full-stack web application for managing construction materials inventory (rocks, soil, sand) and employee payroll for truck drivers.

**Business Domain:**
- Track stock movements (in/out) for construction materials
- Record employee trip data with automatic rate calculation
- Calculate monthly salaries including base pay, trip income, and advance deductions
- Generate PDF reports (salary slips, stock reports)
- Real-time alerts for low stock via dashboard and LINE Notify

**Target Users:** Small-to-medium construction material suppliers in Thailand

---

## Current State Analysis

### ✅ Completed
1. **Documentation Foundation**
   - `CLAUDE.md` - Comprehensive development guide with architecture patterns
   - `README.md` - Project overview and quickstart
   - `docs/project-documentation.md` - Full technical specification
   - `.mahirolab/` - Codex Level 2 integration configured

2. **Project Structure**
   - Git repository initialized
   - `.gitignore` configured
   - Mahiro Lab state management ready

### ❌ Pending (Phase 1 Tasks)
1. **Project Initialization**
   - [ ] Initialize Next.js 16 project with TypeScript
   - [ ] Configure Tailwind CSS v4 (CSS-first)
   - [ ] Setup tsconfig.json with strict mode
   - [ ] Install core dependencies

2. **Database Setup**
   - [ ] Install Prisma and PostgreSQL client
   - [ ] Create Prisma schema based on documentation
   - [ ] Configure DATABASE_URL in .env
   - [ ] Run initial migration
   - [ ] Setup Prisma Client singleton

3. **UI Framework**
   - [ ] Initialize shadcn/ui
   - [ ] Install required components (button, input, select, table, form, card, badge, alert, tabs, sheet, dialog, calendar)
   - [ ] Configure theme in globals.css

4. **Authentication**
   - [ ] Create auth system (credentials-based)
   - [ ] Setup middleware for protected routes
   - [ ] Create login page

5. **Dashboard Layout**
   - [ ] Create root layout with Thai font support
   - [ ] Build dashboard layout with sidebar navigation
   - [ ] Setup route groups (auth, dashboard)

---

## Technical Stack

### Core Technologies
- **Next.js 16** (App Router) + React 19 + TypeScript (strict)
- **Tailwind CSS v4** (CSS-first configuration)
- **shadcn/ui** (Radix UI components)
- **Prisma + PostgreSQL 14+**

### Key Libraries
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack Query (30s polling for alerts)
- **PDF Generation:** @react-pdf/renderer
- **Excel:** ExcelJS
- **Charts:** Recharts
- **Scheduling:** node-cron (08:00 daily alerts)
- **Notifications:** LINE Notify API

---

## Database Architecture

### Core Entities & Relations

**materials** (วัสดุ)
- Primary material types: หิน (rock), ดิน (soil), ทราย (sand)
- Tracks `current_stock` and `min_stock_alert` threshold
- Auto-updated via transactions

**stock_in / stock_out** (บันทึกสต็อก)
- Transaction logs with `quantity`, `unit_price`, `supplier`
- FK to materials
- Must use Prisma transactions to update `current_stock`

**employees** (พนักงาน)
- Fields: `name`, `truck_license`, `base_salary`, `rate_per_trip`
- Status: 'active' | 'inactive'

**trips** (การวิ่งงาน)
- Daily trip records: `route`, `material_id`, `quantity`, `rate`
- FK to employee and material
- Used for salary calculation

**advances** (เบิกเงินล่วงหน้า)
- Advance payments deducted from monthly salary
- Linked to employee

**salary_summaries** (สรุปเงินเดือนรายเดือน)
- Monthly aggregation: `(base_salary + total_trip_income) - total_advances`
- Unique constraint: `(employee_id, month, year)`
- Tracks `is_paid` and `paid_date`

---

## Critical Implementation Patterns

### 1. Server vs Client Components
```typescript
// Default: Server Component (data fetching, static content)
export default async function StockPage() {
  const materials = await prisma.materials.findMany();
  return <Table data={materials} />;
}

// Client Component (forms, interactivity, polling)
'use client';
export function StockInForm() {
  const form = useForm<StockInInput>({
    resolver: zodResolver(stockInSchema)
  });
  // ...
}
```

### 2. Form Validation (React Hook Form + Zod)
```typescript
// lib/validations/stock.ts
export const stockInSchema = z.object({
  material_id: z.number(),
  quantity: z.number().positive(),
  unit_price: z.number().optional(),
  supplier: z.string().optional(),
  transaction_date: z.date(),
});

// Usage in component
const form = useForm<z.infer<typeof stockInSchema>>({
  resolver: zodResolver(stockInSchema),
  defaultValues: { transaction_date: new Date() }
});
```

### 3. Prisma Transactions (Stock Updates)
```typescript
// ALWAYS use transactions for stock updates
await prisma.$transaction([
  prisma.stock_in.create({
    data: { material_id, quantity, unit_price, supplier }
  }),
  prisma.materials.update({
    where: { id: material_id },
    data: { current_stock: { increment: quantity } }
  })
]);
```

### 4. Real-time Alerts (TanStack Query)
```typescript
// components/dashboard/stock-alerts.tsx
const { data: lowStockItems } = useQuery({
  queryKey: ['low-stock'],
  queryFn: async () => {
    const res = await fetch('/api/stock/low-stock');
    return res.json();
  },
  refetchInterval: 30000, // Poll every 30 seconds
});
```

---

## File Structure (Target)

```
stock-management/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── stock/
│   │   │   ├── in/page.tsx
│   │   │   ├── out/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── employees/
│   │   │   ├── trips/page.tsx
│   │   │   └── salary/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── stock/
│   │   ├── employees/
│   │   └── cron/
│   │       └── stock-alert/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn/ui (auto-generated)
│   ├── forms/           # React Hook Form components
│   ├── tables/          # Data tables
│   ├── pdf/             # PDF templates
│   └── dashboard/       # Dashboard widgets
├── lib/
│   ├── prisma.ts        # Singleton client
│   ├── auth.ts
│   ├── utils.ts
│   ├── line-notify.ts
│   └── validations/
│       ├── stock.ts
│       └── employee.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Next Immediate Steps

### Step 1: Initialize Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```
Configuration:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: @/* (default)

### Step 2: Install Dependencies
```bash
npm install @prisma/client @react-pdf/renderer react-hook-form zod @hookform/resolvers @tanstack/react-query exceljs node-cron bcrypt
npm install -D prisma @types/node-cron @types/bcrypt
```

### Step 3: Setup Prisma
```bash
npx prisma init
# Then create schema based on docs/project-documentation.md
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Setup shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button input select table form card badge alert tabs sheet dialog calendar
```

### Step 5: Configure Tailwind v4
Update `app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --font-family-sans: 'Sarabun', sans-serif;
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --radius-md: 0.5rem;
}
```

---

## Key Constraints & Requirements

### Type Safety
- ❌ NO `any` types (strict TypeScript)
- ✅ Generate Prisma types after schema changes
- ✅ Use Zod for runtime validation

### Language
- **Code:** English (variables, types, comments)
- **UI/UX:** Thai language (labels, messages)
- **Database Content:** Thai (material names, employee names)

### Security
- Hash passwords with bcrypt
- Validate inputs with Zod at all boundaries
- Use Prisma prepared statements
- Never commit `.env` to git
- Check `quantity <= current_stock` before stock-out

### Performance
- Use Server Components by default
- Client Components only for interactivity
- Database indexes on foreign keys
- Optimize queries (include relations)

---

## Critical Decision Points

### ✅ Confirmed Decisions
1. **Architecture:** Next.js 16 App Router (NOT Pages Router)
2. **Database:** PostgreSQL with Prisma ORM
3. **UI Framework:** shadcn/ui on Radix UI
4. **Styling:** Tailwind CSS v4 CSS-first
5. **Forms:** React Hook Form + Zod
6. **Auth:** Credentials-based (no OAuth)
7. **Alerts:** TanStack Query polling + LINE Notify cron

### ⚠️ Pending Decisions
1. PostgreSQL hosting (local dev vs Railway/Supabase)
2. Deployment platform (Vercel vs Railway)
3. Thai font choice (TH Sarabun New recommended)
4. LINE Notify token acquisition

---

## Risk Assessment

### High Priority Risks
1. **Prisma Transaction Handling**
   - Risk: Stock quantity inconsistencies
   - Mitigation: Always use `$transaction` for stock updates
   - Validation: Write tests for concurrent transactions

2. **Type Safety Violations**
   - Risk: Runtime errors from `any` types
   - Mitigation: Strict TypeScript + Zod validation
   - Validation: `npx tsc --noEmit` in CI

3. **Missing Validation**
   - Risk: Invalid data in database
   - Mitigation: Zod schemas at all boundaries
   - Validation: Check stock-out quantity <= current_stock

### Medium Priority Risks
1. **LINE Notify Token Security**
   - Risk: Token leakage
   - Mitigation: Environment variables only, never commit

2. **PDF Generation Performance**
   - Risk: Slow salary slip generation
   - Mitigation: Generate on-demand, cache if needed

---

## Reference Documentation

- **Primary:** `docs/project-documentation.md` - Full technical spec
- **Dev Guide:** `CLAUDE.md` - Architecture patterns & commands
- **Workflow:** `.mahirolab/docs/SHORTCODES.md` - Codex protocol

---

## Success Criteria (Phase 1)

- [ ] `npm run dev` starts development server
- [ ] Database connected and migrations applied
- [ ] shadcn/ui components installed and themed
- [ ] Login page renders with Thai font
- [ ] Dashboard layout with sidebar navigation
- [ ] TypeScript strict mode with zero errors
- [ ] Tailwind CSS v4 working with custom theme

---

## Notes & Observations

- Project is greenfield - no legacy code constraints
- Strong documentation foundation already established
- Clear business requirements from construction materials domain
- Thai language UI is critical for user adoption
- Real-time stock alerts are high-priority feature

---

**Context Version:** 1.0
**Last Updated:** 2026-01-05
**Next Action:** Run `nnn` to create implementation plan for Phase 1 setup
