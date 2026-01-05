import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/session';
import { materialSchema } from '@/lib/validations/stock';

// GET - Get single material
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

    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'ไม่พบวัสดุ' },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ' },
      { status: 500 }
    );
  }
}

// PUT - Update material
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
    const validatedData = materialSchema.parse(body);

    const material = await prisma.material.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json(
        { error: 'ไม่พบวัสดุ' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตวัสดุ' },
      { status: 500 }
    );
  }
}

// DELETE - Delete material
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

    // Check if material has transactions
    const stockInCount = await prisma.stockIn.count({
      where: { material_id: id },
    });
    const stockOutCount = await prisma.stockOut.count({
      where: { material_id: id },
    });

    if (stockInCount > 0 || stockOutCount > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบวัสดุที่มีประวัติการทำธุรกรรมได้' },
        { status: 400 }
      );
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'ลบวัสดุสำเร็จ' });
  } catch (error) {
    console.error('Error deleting material:', error);
    
    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json(
        { error: 'ไม่พบวัสดุ' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบวัสดุ' },
      { status: 500 }
    );
  }
}

