'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockInForm } from '@/components/forms/stock-in-form';
import { StockInFormData } from '@/lib/validations/stock';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
}

export default function StockInPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stock/materials');
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลวัสดุ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleSubmit = async (data: StockInFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/stock/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          transaction_date: data.transaction_date.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle Zod validation errors
        if (errorData.details && errorData.details.issues) {
          const zodErrors = errorData.details.issues
            .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');
          throw new Error(`ข้อมูลไม่ถูกต้อง: ${zodErrors}`);
        }
        throw new Error(errorData.error || 'Failed to create stock in');
      }

      setSuccess('บันทึกสต็อกเข้าสำเร็จ');
      
      // Refresh materials to update current_stock
      const materialsResponse = await fetch('/api/stock/materials');
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);
      }
    } catch (error) {
      console.error('Error creating stock in:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกสต็อกเข้า'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">บันทึกสต็อกเข้า</h1>
        <p className="text-gray-500">บันทึกการรับวัสดุเข้าคลัง</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ฟอร์มบันทึกสต็อกเข้า</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">กำลังโหลดข้อมูลวัสดุ...</div>
          ) : materials.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ยังไม่มีข้อมูลวัสดุ กรุณาเพิ่มวัสดุก่อน{' '}
                <a
                  href="/stock/materials"
                  className="text-primary underline"
                >
                  ไปที่หน้าจัดการวัสดุ
                </a>
              </AlertDescription>
            </Alert>
          ) : (
            <StockInForm
              materials={materials}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

