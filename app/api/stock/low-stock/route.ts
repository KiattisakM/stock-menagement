import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get materials with low stock (current_stock <= min_stock_alert)
export async function GET() {
  try {
    // Get all materials with min_stock_alert set
    const materials = await prisma.material.findMany({
      where: {
        min_stock_alert: { not: null },
      },
      orderBy: { name: 'asc' },
    });

    // Filter in application layer since Prisma doesn't support comparing Decimal fields directly
    const lowStockMaterials = materials
      .filter((material) => {
        if (material.min_stock_alert === null) return false;
        return (
          material.current_stock.toNumber() <= material.min_stock_alert.toNumber()
        );
      })
      .map((material) => ({
        id: material.id,
        name: material.name,
        unit: material.unit,
        current_stock: material.current_stock.toNumber(),
        min_stock_alert: material.min_stock_alert!.toNumber(),
        created_at: material.created_at.toISOString(),
      }));

    return NextResponse.json(lowStockMaterials);
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสต็อกต่ำ' },
      { status: 500 }
    );
  }
}

