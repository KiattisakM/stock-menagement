import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { tripSchema } from '@/lib/validations/employee';

// POST - Create trip record
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Convert ISO date string to Date object if needed
    if (body.trip_date && typeof body.trip_date === 'string') {
      body.trip_date = new Date(body.trip_date);
    }
    const validatedData = tripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        employee_id: validatedData.employee_id,
        trip_date: validatedData.trip_date,
        route: validatedData.route,
        material_id: validatedData.material_id,
        quantity: validatedData.quantity,
        rate: validatedData.rate,
        note: validatedData.note,
      },
      include: {
        employee: true,
        material: true,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกการวิ่งงาน' },
      { status: 500 }
    );
  }
}

// GET - List trips
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
      where.trip_date = {
        gte: start,
        lte: end,
      };
    } else if (startDate || endDate) {
      where.trip_date = {};
      if (startDate) {
        where.trip_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.trip_date.lte = new Date(endDate);
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        employee: true,
        material: true,
      },
      orderBy: { trip_date: 'desc' },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการวิ่งงาน' },
      { status: 500 }
    );
  }
}

