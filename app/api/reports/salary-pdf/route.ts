import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { SalarySlipPDF } from '@/components/pdf/salary-slip';

export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const salaryId = searchParams.get('id');

    if (!salaryId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ ID ของเงินเดือน' },
        { status: 400 }
      );
    }

    const salarySummary = await prisma.salarySummary.findUnique({
      where: { id: parseInt(salaryId) },
      include: { employee: true },
    });

    if (!salarySummary) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลเงินเดือน' },
        { status: 404 }
      );
    }

    const pdf = React.createElement(SalarySlipPDF, {
      employeeName: salarySummary.employee.name,
      month: salarySummary.month,
      year: salarySummary.year,
      baseSalary: salarySummary.base_salary.toNumber(),
      totalTrips: salarySummary.total_trips,
      totalTripIncome: salarySummary.total_trip_income.toNumber(),
      totalAdvances: salarySummary.total_advances.toNumber(),
      netSalary: salarySummary.net_salary.toNumber(),
      isPaid: salarySummary.is_paid,
      paidDate: salarySummary.paid_date
        ? new Date(salarySummary.paid_date).toLocaleDateString('th-TH')
        : undefined,
    });

    const stream = await renderToStream(pdf);
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="salary-slip-${salarySummary.employee.name}-${salarySummary.month}-${salarySummary.year}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating salary PDF:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้าง PDF' },
      { status: 500 }
    );
  }
}

