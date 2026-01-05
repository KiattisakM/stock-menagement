# Stock Management System

> ระบบจัดการสต็อกวัสดุก่อสร้างและคำนวณเงินเดือนพนักงานขับรถบรรทุก

A full-stack web application for managing construction materials inventory (rocks, soil, sand) and employee payroll for truck drivers.

## Features

### Stock Management (การจัดการสต็อก)
- ✅ Material inventory tracking (หิน/ดิน/ทราย)
- ✅ Stock in/out transactions with validation
- ✅ Real-time stock balance monitoring
- ✅ Transaction history with filtering
- ✅ Automatic stock alerts when inventory is low
- ✅ Daily LINE notifications at 08:00 for low stock items

### Employee & Payroll (พนักงานและเงินเดือน)
- ✅ Employee management with truck license tracking
- ✅ Daily trip recording with auto-calculated rates
- ✅ Advance payment tracking
- ✅ Monthly salary calculation: `(base_salary + trip_income) - advances`
- ✅ Salary payment status tracking

### Reports & Export (รายงานและส่งออกข้อมูล)
- ✅ PDF generation for salary slips and stock reports
- ✅ Excel export for monthly summaries
- ✅ Analytics dashboard with charts (Recharts)
- ✅ Real-time dashboard alerts with 30-second polling

## Technology Stack

### Frontend & Backend
- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS-first configuration
- **shadcn/ui** - Radix UI components

### Database & ORM
- **PostgreSQL 14+**
- **Prisma** - Type-safe database client

### Key Libraries
- **@react-pdf/renderer** - PDF generation
- **ExcelJS** - Excel export/import
- **Recharts** - Charts and analytics
- **TanStack Query** - Data fetching with real-time polling
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **node-cron** - Scheduled tasks
- **LINE Notify API** - Push notifications

## Prerequisites

- **Node.js** 18+ and pnpm
- **PostgreSQL** 14+
- **LINE Notify Token** (optional, for notifications)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd stock-menagement
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/stock_management"
LINE_NOTIFY_TOKEN="your_line_notify_token_here"
NEXT_PUBLIC_URL="http://localhost:3000"
```

### 4. Setup database
```bash
# Initialize Prisma
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# (Optional) Seed sample data
pnpm prisma db seed
```

### 5. Install shadcn/ui components
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input select table form card badge alert tabs sheet dialog calendar
```

### 6. Run development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Common Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database
```bash
pnpm prisma studio              # Open Prisma Studio (database GUI)
pnpm prisma migrate dev         # Create and apply migration
pnpm prisma migrate reset       # Reset database (DANGER)
pnpm prisma generate            # Generate Prisma Client
```

### Testing
```bash
pnpm test:use-cases            # Test all use cases from documentation
```

See `docs/test-results.md` for test results.

## Project Structure

```
stock-menagement/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   └── login/
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── stock/           # Stock management
│   │   │   ├── in/         # Stock in
│   │   │   ├── out/        # Stock out
│   │   │   └── history/    # Transaction history
│   │   ├── employees/       # Employee management
│   │   │   ├── trips/      # Trip recording
│   │   │   └── salary/     # Salary calculation
│   │   └── layout.tsx      # Dashboard layout
│   ├── api/                # API routes
│   │   ├── stock/
│   │   ├── employees/
│   │   └── cron/           # Scheduled tasks
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   ├── tables/             # Data tables
│   ├── pdf/                # PDF templates
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication
│   ├── line-notify.ts      # LINE integration
│   └── validations/        # Zod schemas
├── prisma/
│   └── schema.prisma       # Database schema
└── docs/
    └── project-documentation.md
```

## Database Schema

### Core Tables

**materials** - Material types (หิน/ดิน/ทราย)
- Tracks `current_stock` and `min_stock_alert` threshold

**stock_in / stock_out** - Inventory transactions
- Automatic `current_stock` updates via Prisma transactions

**employees** - Employee records
- Stores `truck_license`, `base_salary`, `rate_per_trip`

**trips** - Daily trip records
- Links to employees and materials
- Contains `route`, `quantity`, `rate`

**advances** - Advance payments
- Deducted from monthly salary

**salary_summaries** - Monthly salary aggregation
- Formula: `(base_salary + total_trip_income) - total_advances`

See `docs/project-documentation.md` for detailed schema.

## Development Roadmap

### Phase 1: Setup ✅ CURRENT
- [x] Initialize Next.js 16 + TypeScript
- [x] Setup Prisma with PostgreSQL
- [ ] Install shadcn/ui components
- [ ] Create database schema
- [ ] Setup authentication
- [ ] Create dashboard layout

### Phase 2: Stock Management (Week 3-4)
- [ ] CRUD for materials
- [ ] Stock in/out forms
- [ ] Transaction history
- [ ] Real-time balance display

### Phase 3: Employee & Payroll (Week 5-6)
- [ ] CRUD for employees
- [ ] Trip recording
- [ ] Advance tracking
- [ ] Salary calculation

### Phase 4: Reports & Alerts (Week 7-8)
- [ ] PDF templates
- [ ] Excel export
- [ ] Dashboard alerts
- [ ] LINE Notify integration

### Phase 5: Deployment (Week 9-10)
- [ ] Testing
- [ ] Production deployment
- [ ] User acceptance testing

## Key Implementation Patterns

### Server vs Client Components
- **Server Components** (default): Data fetching, static content
- **Client Components** (`'use client'`): Forms, interactivity, browser APIs

### Form Validation
All forms use React Hook Form + Zod:
```typescript
const form = useForm<z.infer<typeof stockInSchema>>({
  resolver: zodResolver(stockInSchema),
});
```

### Database Transactions
Critical stock updates use Prisma transactions:
```typescript
await prisma.$transaction([
  prisma.stock_in.create({ data: { ... } }),
  prisma.materials.update({
    data: { current_stock: { increment: quantity } }
  })
]);
```

### Real-time Alerts
Dashboard uses TanStack Query with 30-second polling:
```typescript
const { data } = useQuery({
  queryKey: ['low-stock'],
  queryFn: fetchLowStock,
  refetchInterval: 30000,
});
```

## Documentation

- **CLAUDE.md** - Development guidelines for Claude Code
- **docs/project-documentation.md** - Complete technical specification
- **docs/test-results.md** - Use case test results
- **.mahirolab/docs/** - Mahiro Lab integration guides

## Security Notes

⚠️ **Important:**
- Never commit `.env` file
- Hash passwords with bcrypt
- Validate all inputs with Zod schemas
- Use Prisma prepared statements
- Check stock availability before stock-out operations

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Specify your license here]

## Support

For issues or questions, please refer to:
- `CLAUDE.md` for development guidelines
- `docs/project-documentation.md` for technical details

---

**Built with Next.js 16, React 19, Prisma, and shadcn/ui**
