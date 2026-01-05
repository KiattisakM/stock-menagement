import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLineNotify, formatLowStockMessage } from '@/lib/line-notify';

/**
 * Cron job endpoint for daily stock alerts at 08:00
 * This endpoint should be called by an external cron service (e.g., Vercel Cron, GitHub Actions, etc.)
 * or scheduled via node-cron in a separate worker process
 */
export async function GET(request: Request) {
  try {
    // Verify request is from authorized source (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all materials with low stock
    const materials = await prisma.material.findMany({
      where: {
        min_stock_alert: { not: null },
      },
    });

    // Filter materials where current_stock <= min_stock_alert
    const lowStockMaterials = materials.filter((material) => {
      if (material.min_stock_alert === null) return false;
      return (
        material.current_stock.toNumber() <= material.min_stock_alert.toNumber()
      );
    });

    if (lowStockMaterials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No low stock items found',
        alertCount: 0,
      });
    }

    // Format and send LINE notification
    const message = formatLowStockMessage(
      lowStockMaterials.map((m) => ({
        name: m.name,
        unit: m.unit,
        current_stock: m.current_stock.toNumber(),
        min_stock_alert: m.min_stock_alert!.toNumber(),
      }))
    );

    const sent = await sendLineNotify({ message });

    return NextResponse.json({
      success: sent,
      message: sent
        ? 'Stock alert sent successfully'
        : 'Failed to send LINE notification',
      alertCount: lowStockMaterials.length,
      materials: lowStockMaterials.map((m) => ({
        id: m.id,
        name: m.name,
        current_stock: m.current_stock.toNumber(),
        min_stock_alert: m.min_stock_alert?.toNumber(),
      })),
    });
  } catch (error) {
    console.error('Error in stock alert cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process stock alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}

