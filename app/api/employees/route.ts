import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { employeeSchema } from '@/lib/validations/employee';

// GET - List all employees
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { status?: 'active' | 'inactive' } = {};
    if (status === 'active' || status === 'inactive') {
      where.status = status;
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    const employee = await prisma.employee.create({
      data: validatedData,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างพนักงาน' },
      { status: 500 }
    );
  }
}

