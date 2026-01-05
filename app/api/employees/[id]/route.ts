import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { employeeSchema } from '@/lib/validations/employee';

// GET - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'ไม่พบพนักงาน' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = employeeSchema.parse(body);

    const employee = await prisma.employee.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json(
        { error: 'ไม่พบพนักงาน' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตพนักงาน' },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Check if employee has trips, advances, or salary summaries
    const tripCount = await prisma.trip.count({
      where: { employee_id: id },
    });
    const advanceCount = await prisma.advance.count({
      where: { employee_id: id },
    });
    const salaryCount = await prisma.salarySummary.count({
      where: { employee_id: id },
    });

    if (tripCount > 0 || advanceCount > 0 || salaryCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบพนักงานที่มีประวัติการทำงานได้' },
        { status: 400 }
      );
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'ลบพนักงานสำเร็จ' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    
    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json(
        { error: 'ไม่พบพนักงาน' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบพนักงาน' },
      { status: 500 }
    );
  }
}

