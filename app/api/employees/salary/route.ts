import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { salaryCalculationSchema } from '@/lib/validations/employee';

// POST - Calculate and create/update salary summary
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = salaryCalculationSchema.parse(body);

    const { month, year } = validatedData;

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'active' },
    });

    const results = [];

    for (const employee of employees) {
      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get trips for this employee in this month
      const trips = await prisma.trip.findMany({
        where: {
          employee_id: employee.id,
          trip_date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Calculate total trip income
      const totalTripIncome = trips.reduce(
        (sum, trip) => sum + trip.rate.toNumber(),
        0
      );

      // Get advances for this employee in this month
      const advances = await prisma.advance.findMany({
        where: {
          employee_id: employee.id,
          advance_date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Calculate total advances
      const totalAdvances = advances.reduce(
        (sum, advance) => sum + advance.amount.toNumber(),
        0
      );

      // Calculate net salary: (base_salary + total_trip_income) - total_advances
      const baseSalary = employee.base_salary.toNumber();
      const netSalary = baseSalary + totalTripIncome - totalAdvances;

      // Create or update salary summary
      const salarySummary = await prisma.salarySummary.upsert({
        where: {
          employee_id_month_year: {
            employee_id: employee.id,
            month,
            year,
          },
        },
        update: {
          total_trips: trips.length,
          total_trip_income: totalTripIncome,
          total_advances: totalAdvances,
          base_salary: baseSalary,
          net_salary: netSalary,
        },
        create: {
          employee_id: employee.id,
          month,
          year,
          total_trips: trips.length,
          total_trip_income: totalTripIncome,
          total_advances: totalAdvances,
          base_salary: baseSalary,
          net_salary: netSalary,
        },
        include: {
          employee: true,
        },
      });

      results.push(salarySummary);
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Error calculating salary:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการคำนวณเงินเดือน' },
      { status: 500 }
    );
  }
}

// GET - Get salary summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employee_id');

    const where: any = {};
    
    if (month) {
      where.month = parseInt(month);
    }
    if (year) {
      where.year = parseInt(year);
    }
    if (employeeId) {
      where.employee_id = parseInt(employeeId);
    }

    const salarySummaries = await prisma.salarySummary.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { employee: { name: 'asc' } },
      ],
    });

    return NextResponse.json(salarySummaries);
  } catch (error) {
    console.error('Error fetching salary summaries:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเงินเดือน' },
      { status: 500 }
    );
  }
}

// PUT - Update salary summary (mark as paid)
export async function PUT(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_paid } = body;

    if (typeof id !== 'number' || typeof is_paid !== 'boolean') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const salarySummary = await prisma.salarySummary.update({
      where: { id },
      data: {
        is_paid,
        paid_date: is_paid ? new Date() : null,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(salarySummary);
  } catch (error) {
    console.error('Error updating salary summary:', error);
    
    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลเงินเดือน' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลเงินเดือน' },
      { status: 500 }
    );
  }
}

