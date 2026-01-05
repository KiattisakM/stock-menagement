import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { advanceSchema } from '@/lib/validations/employee';

// POST - Create advance payment
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Convert ISO date string to Date object if needed
    if (body.advance_date && typeof body.advance_date === 'string') {
      body.advance_date = new Date(body.advance_date);
    }
    const validatedData = advanceSchema.parse(body);

    const advance = await prisma.advance.create({
      data: {
        employee_id: validatedData.employee_id,
        amount: validatedData.amount,
        advance_date: validatedData.advance_date,
        note: validatedData.note,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(advance, { status: 201 });
  } catch (error) {
    console.error('Error creating advance:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกเบิกเงินล่วงหน้า' },
      { status: 500 }
    );
  }
}

// GET - List advances
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: any = {};
    
    if (employeeId) {
      where.employee_id = parseInt(employeeId);
    }
    
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.advance_date = {
        gte: start,
        lte: end,
      };
    } else if (startDate || endDate) {
      where.advance_date = {};
      if (startDate) {
        where.advance_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.advance_date.lte = new Date(endDate);
      }
    }

    const advances = await prisma.advance.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: { advance_date: 'desc' },
    });

    return NextResponse.json(advances);
  } catch (error) {
    console.error('Error fetching advances:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลเบิกเงินล่วงหน้า' },
      { status: 500 }
    );
  }
}

