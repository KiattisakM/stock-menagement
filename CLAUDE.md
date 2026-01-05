# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stock Management System** - A full-stack web application for managing construction materials inventory (rocks, soil, sand) and employee payroll for truck drivers. Built with Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, and Prisma + PostgreSQL.

**Current Status:** Project is in setup phase - only documentation exists. The codebase needs to be built following the architecture defined in `docs/project-documentation.md`.

---

## Technology Stack

### Frontend & Backend
- **Next.js 16** with App Router (NOT Pages Router)
- **React 19** with Server Components by default
- **TypeScript** (strict mode, no `any` types)
- **Tailwind CSS v4** with CSS-first configuration (`@import "tailwindcss"`)
- **shadcn/ui** - Copy components via CLI before using

### Database & ORM
- **PostgreSQL 14+**
- **Prisma** - Use transactions for critical operations

### UI & Documents
- **Radix UI** (via shadcn/ui)
- **@react-pdf/renderer** - PDF generation with React components
- **ExcelJS** - Excel export/import
- **Recharts** - Charts and analytics
- **TanStack Query** - Data fetching with 30s polling for alerts

### Additional Tools
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **node-cron** - Scheduled tasks (08:00 stock alerts)
- **Line Notify API** - LINE notifications

---

## Common Commands

### Development
```bash
# Install dependencies
npm install
# or for initial setup with all required packages:
npm install @prisma/client @react-pdf/renderer react-hook-form zod @hookform/resolvers @tanstack/react-query exceljs node-cron
npm install -D prisma @types/node-cron

# Setup Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# Setup shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input select table form card badge alert tabs sheet dialog calendar

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing & Linting
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Database
```bash
# Create migration
npx prisma migrate dev --name <migration_name>

# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

---

## Architecture & Code Structure

### App Router Pattern
All pages live in `/app` directory using Next.js 16 App Router:

```
app/
├── (auth)/              # Auth layout group
│   ├── login/
│   └── layout.tsx
├── (dashboard)/         # Dashboard layout group
│   ├── dashboard/       # Main dashboard
│   ├── stock/
│   │   ├── in/         # Stock in transactions
│   │   ├── out/        # Stock out transactions
│   │   └── history/    # Transaction history
│   ├── employees/
│   │   ├── trips/      # Trip recording
│   │   └── salary/     # Salary calculation
│   └── layout.tsx      # Dashboard layout with sidebar
├── api/                # API routes (Route Handlers)
│   ├── stock/
│   ├── employees/
│   └── cron/           # Scheduled tasks
│       └── stock-alert/
└── layout.tsx          # Root layout
```

### Component Organization
```
components/
├── ui/                 # shadcn/ui components (auto-generated)
├── forms/              # Form components with React Hook Form + Zod
│   ├── stock-in-form.tsx
│   ├── stock-out-form.tsx
│   └── trip-form.tsx
├── tables/             # Data table components
├── pdf/                # PDF templates with @react-pdf/renderer
│   ├── salary-slip.tsx
│   ├── stock-report.tsx
│   └── monthly-report.tsx
└── dashboard/
    └── stock-alerts.tsx  # Real-time alerts with polling
```

### Library Code
```
lib/
├── prisma.ts           # Singleton Prisma Client instance
├── auth.ts             # Authentication utilities
├── utils.ts            # Utility functions
├── line-notify.ts      # LINE Notify integration
└── validations/
    ├── stock.ts        # Zod schemas for stock
    └── employee.ts     # Zod schemas for employees
```

---

## Database Architecture

### Core Tables & Relations

**materials** (วัสดุ)
- Stores material types (หิน/ดิน/ทราย)
- Tracks `current_stock` and `min_stock_alert` threshold
- Updated automatically on stock in/out transactions

**stock_in / stock_out** (บันทึกสต็อก)
- Transaction logs for inventory movements
- Foreign key to `materials.id`
- Automatic `current_stock` updates via Prisma transactions

**employees** (พนักงาน)
- Stores employee data including `truck_license`, `base_salary`, `rate_per_trip`
- `status` enum: 'active' | 'inactive'

**trips** (การวิ่งงาน)
- Daily trip records linked to employees
- Contains `route`, `material_id`, `quantity`, `rate`

**advances** (เบิกเงินล่วงหน้า)
- Advance payment records
- Deducted from monthly salary calculation

**salary_summaries** (สรุปเงินเดือนรายเดือน)
- Monthly aggregation: `(base_salary + total_trip_income) - total_advances`
- Unique constraint on `(employee_id, month, year)`
- Tracks `is_paid` and `paid_date`

### Critical Transaction Pattern
When updating stock, always use Prisma transactions:
```typescript
await prisma.$transaction([
  prisma.stock_in.create({ data: { ... } }),
  prisma.materials.update({
    where: { id: materialId },
    data: { current_stock: { increment: quantity } }
  })
]);
```

---

## Key Implementation Patterns

### Server vs Client Components
- **Server Components** (default): Use for data fetching, static content, API calls
- **Client Components** (`'use client'`): Use only when needed for:
  - Interactive forms (React Hook Form)
  - Real-time polling (TanStack Query)
  - Browser-only APIs (localStorage, window)
  - Event handlers (onClick, onChange)

### Form Validation Pattern
All forms use React Hook Form + Zod:
```typescript
// lib/validations/stock.ts
export const stockInSchema = z.object({
  material_id: z.number(),
  quantity: z.number().positive(),
  unit_price: z.number().optional(),
  supplier: z.string().optional(),
  transaction_date: z.date(),
});

// Component usage
const form = useForm<z.infer<typeof stockInSchema>>({
  resolver: zodResolver(stockInSchema),
  defaultValues: { transaction_date: new Date() }
});
```

### Real-time Alert System
**Dashboard alerts** use TanStack Query with 30-second polling:
```typescript
const { data: lowStockItems } = useQuery({
  queryKey: ['low-stock'],
  queryFn: async () => {
    const res = await fetch('/api/stock/low-stock');
    return res.json();
  },
  refetchInterval: 30000, // 30 seconds
});
```

**LINE Notify** runs via node-cron at 08:00 daily:
- Check materials where `current_stock <= min_stock_alert`
- Send formatted message via LINE Notify API
- Requires `LINE_NOTIFY_TOKEN` in `.env`

### PDF Generation
Use `@react-pdf/renderer` for all PDF exports:
- Create React component-based templates in `components/pdf/`
- Support Thai fonts (TH Sarabun New recommended)
- Use `PDFDownloadLink` for client-side download
- Follow templates in docs/project-documentation.md (lines 1005-1056)

---

## Mahiro Lab Integration

This project uses **Mahiro Lab Codex Level 2** integration with shortcode protocol.

### Important Shortcodes
- `lll` - List project status (check progress, git status, recent activity)
- `ccc` - Create session context with continuity support
- `nnn` - Create implementation plan with prerequisites
- `gogogo` - Execute plan with real-time progress tracking
- `rrr` - Create comprehensive retrospective
- `rrresearch "topic"` - Claude-managed research with web search
- `www [reasoning] "task"` - Claude-managed background worker

### State Management
All session state lives in `.mahirolab/state/`:
- `context.md` - Current session context
- `context_history/` - Versioned context snapshots
- `plans/` - Implementation plans
- `progress.md` - Real-time execution progress
- `retrospectives/` - Session summaries
- `execution_log.md` - Detailed event timeline

### Typical Workflow
```bash
lll → ccc → nnn → gogogo → rrr
```

**Reference:** See `.mahirolab/docs/SHORTCODES.md` for complete protocol

---

## Development Guidelines

### Type Safety
- Strict TypeScript: NO `any` types
- Generate Prisma types: Run `npx prisma generate` after schema changes
- Use Zod for runtime validation at system boundaries

### Tailwind CSS v4
- Use CSS-first configuration in `app/globals.css`:
  ```css
  @import "tailwindcss";

  @theme {
    --color-primary: #3b82f6;
    --radius-md: 0.5rem;
  }
  ```
- Avoid inline style objects - use Tailwind classes

### shadcn/ui Components
- Copy components via CLI before first use: `npx shadcn@latest add <component>`
- Customize source code directly in `components/ui/`
- Required components: button, input, select, table, form, card, badge, alert, tabs, sheet, dialog, calendar, date-picker

### API Routes (Route Handlers)
- Location: `app/api/`
- Use App Router conventions (`route.ts` files)
- Return `Response.json()` instead of `res.json()`
- Handle errors with proper HTTP status codes

### Security
- Hash passwords with bcrypt
- Validate all inputs with Zod schemas
- Use Prisma prepared statements (prevents SQL injection)
- Never commit `.env` file (use `.env.example`)
- Check `quantity <= current_stock` before stock-out

---

## Development Roadmap

### Phase 1: Setup (Week 1-2) ✅ CURRENT PHASE
- [ ] Initialize Next.js 16 project with TypeScript + Tailwind
- [ ] Setup Prisma with PostgreSQL
- [ ] Install shadcn/ui and required components
- [ ] Create database schema and run migrations
- [ ] Setup authentication system
- [ ] Create dashboard layout with sidebar

### Phase 2: Stock Management (Week 3-4)
- [ ] CRUD for materials
- [ ] Stock in/out forms with validation
- [ ] Stock history table with filtering
- [ ] Real-time stock balance display

### Phase 3: Employee & Payroll (Week 5-6)
- [ ] CRUD for employees
- [ ] Trip recording with auto-fill rates
- [ ] Advance payment tracking
- [ ] Monthly salary calculation
- [ ] Salary summary table

### Phase 4: Reports & Alerts (Week 7-8)
- [ ] PDF templates (salary slip, stock report)
- [ ] Excel export functionality
- [ ] Real-time dashboard alerts (TanStack Query)
- [ ] LINE Notify integration
- [ ] node-cron scheduled alerts (08:00)

### Phase 5: Testing & Deployment (Week 9-10)
- [ ] Feature testing
- [ ] Bug fixes
- [ ] Deploy to Vercel/Railway
- [ ] User acceptance testing

**Reference:** Full roadmap in `docs/project-documentation.md` (lines 1067-1150)

---

## Important Notes

### Language
- Codebase: English (variable names, comments, types)
- UI/UX: Thai language (labels, messages, PDF content)
- Database content: Thai language (names, notes)

### Data Flow Examples
**Stock In:** User submits form → Validate with Zod → Prisma transaction → Update `current_stock` → Show success toast

**Salary Calculation:** Select month/year → Query trips + advances → Calculate `(base_salary + total_trip_income) - total_advances` → Create/update `salary_summaries` → Display table

**Alert System:** Cron triggers 08:00 → Query `WHERE current_stock <= min_stock_alert` → Format message → Send LINE Notify → Log execution

### Common Pitfalls to Avoid
- ❌ Don't use Pages Router patterns (use App Router)
- ❌ Don't forget `'use client'` for interactive components
- ❌ Don't use `any` type - always define proper types
- ❌ Don't forget Prisma transactions for stock updates
- ❌ Don't skip validation - use Zod schemas
- ❌ Don't commit `.env` with secrets

---

## Reference Documentation

**Primary reference:** `docs/project-documentation.md` contains:
- Complete database schema (lines 372-501)
- Detailed use cases (lines 1154-1205)
- PDF generation examples (lines 1003-1063)
- LINE Notify setup (lines 722-822)
- Full technology stack details (lines 336-368)

**Mahiro Lab:** `.mahirolab/docs/SHORTCODES.md` for workflow protocol

---

## Environment Variables

Required in `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stock_management"

# LINE Notify
LINE_NOTIFY_TOKEN="your_line_notify_token_here"

# Next.js
NEXT_PUBLIC_URL="http://localhost:3000"
```

Create `.env.example` without sensitive values for version control.
