'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripForm } from '@/components/forms/trip-form';
import { TripFormData } from '@/lib/validations/employee';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  rate_per_trip: number;
  status: 'active' | 'inactive';
}

interface Material {
  id: number;
  name: string;
  unit: string;
}

export default function TripsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active employees only
        const employeesRes = await fetch('/api/employees?status=active');
        if (!employeesRes.ok) throw new Error('Failed to fetch employees');
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);

        // Fetch materials
        const materialsRes = await fetch('/api/stock/materials');
        if (!materialsRes.ok) throw new Error('Failed to fetch materials');
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data: TripFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/employees/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          trip_date: data.trip_date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }

      setSuccess('บันทึกการวิ่งงานสำเร็จ');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating trip:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกการวิ่งงาน'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">บันทึกการวิ่งงาน</h1>
        <p className="text-gray-500">บันทึกข้อมูลการวิ่งงานของพนักงาน</p>
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
          <CardTitle>ฟอร์มบันทึกการวิ่งงาน</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีพนักงานที่ใช้งาน กรุณาเพิ่มพนักงานก่อน
            </div>
          ) : (
            <TripForm
              employees={employees}
              materials={materials}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

