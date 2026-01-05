'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Calculator, Download, FileSpreadsheet } from 'lucide-react';

interface SalarySummary {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  total_trips: number;
  total_trip_income: number;
  total_advances: number;
  base_salary: number;
  net_salary: number;
  is_paid: boolean;
  paid_date: string | null;
  employee: {
    id: number;
    name: string;
  };
}

const months = [
  { value: 1, label: 'มกราคม' },
  { value: 2, label: 'กุมภาพันธ์' },
  { value: 3, label: 'มีนาคม' },
  { value: 4, label: 'เมษายน' },
  { value: 5, label: 'พฤษภาคม' },
  { value: 6, label: 'มิถุนายน' },
  { value: 7, label: 'กรกฎาคม' },
  { value: 8, label: 'สิงหาคม' },
  { value: 9, label: 'กันยายน' },
  { value: 10, label: 'ตุลาคม' },
  { value: 11, label: 'พฤศจิกายน' },
  { value: 12, label: 'ธันวาคม' },
];

export default function SalaryPage() {
  const [salarySummaries, setSalarySummaries] = useState<SalarySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchSalarySummaries();
  }, [selectedMonth, selectedYear]);

  const fetchSalarySummaries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      const response = await fetch(`/api/employees/salary?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch salary summaries');
      const data = await response.json();
      setSalarySummaries(data);
    } catch (error) {
      console.error('Error fetching salary summaries:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลเงินเดือน');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/employees/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate salary');
      }

      setSuccess('คำนวณเงินเดือนสำเร็จ');
      await fetchSalarySummaries();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error calculating salary:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการคำนวณเงินเดือน'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMarkAsPaid = async (id: number, isPaid: boolean) => {
    try {
      setError(null);

      const response = await fetch('/api/employees/salary', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_paid: !isPaid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update salary status');
      }

      await fetchSalarySummaries();
    } catch (error) {
      console.error('Error updating salary status:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตสถานะ'
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">คำนวณเงินเดือน</h1>
          <p className="text-gray-500">คำนวณและจัดการเงินเดือนพนักงานรายเดือน</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>เลือกเดือนและปี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">เดือน</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">ปี</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCalculate} disabled={isCalculating}>
              <Calculator className="mr-2 h-4 w-4" />
              {isCalculating ? 'กำลังคำนวณ...' : 'คำนวณเงินเดือน'}
            </Button>
            {salarySummaries.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(
                      `/api/reports/salary-excel?month=${selectedMonth}&year=${selectedYear}`,
                      '_blank'
                    );
                  }}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  ส่งออก Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            สรุปเงินเดือน {months.find((m) => m.value === selectedMonth)?.label}{' '}
            {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : salarySummaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีข้อมูลเงินเดือนสำหรับเดือนนี้
              <br />
              กรุณากดปุ่ม "คำนวณเงินเดือน" เพื่อคำนวณ
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>เงินเดือนฐาน</TableHead>
                  <TableHead>จำนวนเที่ยว</TableHead>
                  <TableHead>รายได้จากเที่ยว</TableHead>
                  <TableHead>เบิกเงินล่วงหน้า</TableHead>
                  <TableHead>เงินเดือนสุทธิ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySummaries.map((summary) => (
                  <TableRow key={summary.id}>
                    <TableCell className="font-medium">
                      {summary.employee.name}
                    </TableCell>
                    <TableCell>{formatCurrency(summary.base_salary)}</TableCell>
                    <TableCell>{summary.total_trips}</TableCell>
                    <TableCell>{formatCurrency(summary.total_trip_income)}</TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(summary.total_advances)}
                    </TableCell>
                    <TableCell className="font-semibold text-lg">
                      {formatCurrency(summary.net_salary)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={summary.is_paid ? 'default' : 'secondary'}>
                        {summary.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(`/api/reports/salary-pdf?id=${summary.id}`, '_blank');
                          }}
                          title="ดาวน์โหลดสลิปเงินเดือน"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={summary.is_paid ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleMarkAsPaid(summary.id, summary.is_paid)}
                        >
                          {summary.is_paid ? 'ยกเลิกการจ่าย' : 'จ่ายเงินเดือน'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

