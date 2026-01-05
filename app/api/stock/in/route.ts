import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { stockInSchema } from '@/lib/validations/stock';

// POST - Create stock in transaction
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Convert ISO date string to Date object if needed
    if (body.transaction_date && typeof body.transaction_date === 'string') {
      body.transaction_date = new Date(body.transaction_date);
    }
    const validatedData = stockInSchema.parse(body);

    // Use transaction to update stock atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create stock in record
      const stockIn = await tx.stockIn.create({
        data: {
          material_id: validatedData.material_id,
          quantity: validatedData.quantity,
          unit_price: validatedData.unit_price,
          supplier: validatedData.supplier,
          note: validatedData.note,
          transaction_date: validatedData.transaction_date,
        },
      });

      // Update material current_stock
      await tx.material.update({
        where: { id: validatedData.material_id },
        data: {
          current_stock: {
            increment: validatedData.quantity,
          },
        },
      });

      return stockIn;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating stock in:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกสต็อกเข้า' },
      { status: 500 }
    );
  }
}

// GET - List stock in transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('material_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const where: any = {};
    if (materialId) {
      where.material_id = parseInt(materialId);
    }
    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) {
        where.transaction_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.transaction_date.lte = new Date(endDate);
      }
    }

    const stockIns = await prisma.stockIn.findMany({
      where,
      include: {
        material: true,
      },
      orderBy: { transaction_date: 'desc' },
    });

    return NextResponse.json(stockIns);
  } catch (error) {
    console.error('Error fetching stock in:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสต็อกเข้า' },
      { status: 500 }
    );
  }
}

