'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvanceForm } from '@/components/forms/advance-form';
import { AdvanceFormData } from '@/lib/validations/employee';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

export default function AdvancesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Fetch active employees only
        const response = await fetch('/api/employees?status=active');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน');
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async (data: AdvanceFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/employees/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          advance_date: data.advance_date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create advance');
      }

      setSuccess('บันทึกเบิกเงินล่วงหน้าสำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating advance:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกเบิกเงินล่วงหน้า'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">เบิกเงินล่วงหน้า</h1>
        <p className="text-gray-500">บันทึกการเบิกเงินล่วงหน้าของพนักงาน</p>
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
          <CardTitle>ฟอร์มเบิกเงินล่วงหน้า</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีพนักงานที่ใช้งาน กรุณาเพิ่มพนักงานก่อน
            </div>
          ) : (
            <AdvanceForm
              employees={employees}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

