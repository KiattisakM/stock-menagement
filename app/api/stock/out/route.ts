import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { stockOutSchema } from '@/lib/validations/stock';

// POST - Create stock out transaction
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
    const validatedData = stockOutSchema.parse(body);

    // Check if material has enough stock
    const material = await prisma.material.findUnique({
      where: { id: validatedData.material_id },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'ไม่พบวัสดุที่เลือก' },
        { status: 404 }
      );
    }

    if (material.current_stock.toNumber() < validatedData.quantity) {
      return NextResponse.json(
        {
          error: `สต็อกไม่พอ (คงเหลือ: ${material.current_stock} ${material.unit})`,
        },
        { status: 400 }
      );
    }

    // Use transaction to update stock atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create stock out record
      const stockOut = await tx.stockOut.create({
        data: {
          material_id: validatedData.material_id,
          quantity: validatedData.quantity,
          customer_name: validatedData.customer_name,
          project_name: validatedData.project_name,
          note: validatedData.note,
          transaction_date: validatedData.transaction_date,
        },
      });

      // Update material current_stock
      await tx.material.update({
        where: { id: validatedData.material_id },
        data: {
          current_stock: {
            decrement: validatedData.quantity,
          },
        },
      });

      return stockOut;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating stock out:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกสต็อกออก' },
      { status: 500 }
    );
  }
}

// GET - List stock out transactions
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

    const stockOuts = await prisma.stockOut.findMany({
      where,
      include: {
        material: true,
      },
      orderBy: { transaction_date: 'desc' },
    });

    return NextResponse.json(stockOuts);
  } catch (error) {
    console.error('Error fetching stock out:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสต็อกออก' },
      { status: 500 }
    );
  }
}

