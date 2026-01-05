import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { exportSalaryToExcel } from '@/lib/excel-export';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'กรุณาระบุเดือนและปี' },
        { status: 400 }
      );
    }

    const salarySummaries = await prisma.salarySummary.findMany({
      where: {
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: { name: 'asc' },
      },
    });

    const excelData = {
      month: parseInt(month),
      year: parseInt(year),
      salaries: salarySummaries.map((s) => ({
        employeeName: s.employee.name,
        baseSalary: s.base_salary.toNumber(),
        totalTrips: s.total_trips,
        totalTripIncome: s.total_trip_income.toNumber(),
        totalAdvances: s.total_advances.toNumber(),
        netSalary: s.net_salary.toNumber(),
        isPaid: s.is_paid,
      })),
    };

    const buffer = await exportSalaryToExcel(excelData);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="salary-${month}-${year}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error generating salary Excel:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้าง Excel' },
      { status: 500 }
    );
  }
}

