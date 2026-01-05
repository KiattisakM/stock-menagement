'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface LowStockMaterial {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
}

export function StockAlerts() {
  const { data: lowStockItems, isLoading } = useQuery<LowStockMaterial[]>({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const res = await fetch('/api/stock/low-stock');
      if (!res.ok) throw new Error('Failed to fetch low stock items');
      const data = await res.json();
      // Ensure all values are properly converted to numbers
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        current_stock: typeof item.current_stock === 'number' 
          ? item.current_stock 
          : Number(item.current_stock),
        min_stock_alert: typeof item.min_stock_alert === 'number'
          ? item.min_stock_alert
          : Number(item.min_stock_alert),
      }));
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  if (isLoading) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>กำลังโหลดข้อมูลแจ้งเตือน...</AlertDescription>
      </Alert>
    );
  }

  if (!lowStockItems || !Array.isArray(lowStockItems) || lowStockItems.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>แจ้งเตือน: สต็อกต่ำ</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          {lowStockItems.map((item) => {
            // Ensure all values are numbers/strings
            const currentStock = typeof item.current_stock === 'number' 
              ? item.current_stock 
              : Number(item.current_stock) || 0;
            const minStockAlert = typeof item.min_stock_alert === 'number'
              ? item.min_stock_alert
              : Number(item.min_stock_alert) || 0;
            
            return (
              <div key={item.id} className="flex items-center justify-between">
                <span>
                  <strong>{String(item.name)}</strong> - คงเหลือ:{' '}
                  {currentStock} {String(item.unit)} (จุดแจ้งเตือน:{' '}
                  {minStockAlert} {String(item.unit)})
                </span>
              </div>
            );
          })}
          <div className="mt-3 pt-2 border-t border-red-200">
            <Link href="/stock/materials">
              <Button variant="outline" size="sm" className="text-xs">
                จัดการวัสดุ
              </Button>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

