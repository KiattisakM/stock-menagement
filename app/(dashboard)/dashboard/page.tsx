'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { StockAlerts } from '@/components/dashboard/stock-alerts';

export default function DashboardPage() {
  const { data: materialsCount } = useQuery({
    queryKey: ['materials-count'],
    queryFn: async () => {
      const res = await fetch('/api/stock/materials');
      if (!res.ok) return 0;
      const data = await res.json();
      return data.length;
    },
  });

  const { data: employeesCount } = useQuery({
    queryKey: ['employees-count'],
    queryFn: async () => {
      const res = await fetch('/api/employees');
      if (!res.ok) return 0;
      const data = await res.json();
      return data.length;
    },
  });

  const { data: lowStockCount } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      const res = await fetch('/api/stock/low-stock');
      if (!res.ok) return 0;
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { data: todayTripsCount } = useQuery({
    queryKey: ['today-trips'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await fetch(
        `/api/employees/trips?start_date=${today.toISOString()}&end_date=${tomorrow.toISOString()}`
      );
      if (!res.ok) return 0;
      const data = await res.json();
      return data.length;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">ภาพรวมระบบจัดการสต็อก</p>
      </div>

      <StockAlerts />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">สต็อกทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsCount ?? 0}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">พนักงาน</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesCount ?? 0}</div>
            <p className="text-xs text-gray-500">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">เที่ยววันนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTripsCount ?? 0}</div>
            <p className="text-xs text-gray-500">เที่ยว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">แจ้งเตือนสต็อก</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount ?? 0}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>ยินดีต้อนรับสู่ระบบจัดการสต็อก</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            ระบบพร้อมใช้งาน เริ่มต้นโดยการเพิ่มข้อมูลวัสดุและพนักงาน
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
