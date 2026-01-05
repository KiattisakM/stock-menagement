import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { materialSchema } from '@/lib/validations/stock';

// GET - List all materials
export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ' },
      { status: 500 }
    );
  }
}

// POST - Create new material
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received body:', body);
    
    const validatedData = materialSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Prisma accepts numbers for Decimal fields - it will convert automatically
    const material = await prisma.material.create({
      data: {
        name: validatedData.name,
        unit: validatedData.unit,
        current_stock: validatedData.current_stock,
        min_stock_alert: validatedData.min_stock_alert ?? null,
      },
    });

    console.log('Created material:', material);

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: error 
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error:', error);
      return NextResponse.json(
        { 
          error: 'เกิดข้อผิดพลาดในการสร้างวัสดุ',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการสร้างวัสดุ',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

