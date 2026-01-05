'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MaterialForm } from '@/components/forms/material-form';
import { MaterialFormData } from '@/lib/validations/stock';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Material {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number | null;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreate = async (data: MaterialFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      console.log('Submitting material data:', data);
      
      const response = await fetch('/api/stock/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        // Handle Zod validation errors
        if (responseData.details) {
          // Check if it's a ZodError
          if (responseData.details.issues) {
            const zodErrors = responseData.details.issues
              .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
              .join(', ');
            throw new Error(`ข้อมูลไม่ถูกต้อง: ${zodErrors}`);
          }
          // Handle other error details
          throw new Error(responseData.details || responseData.error || 'Failed to create material');
        }
        throw new Error(responseData.error || 'Failed to create material');
      }

      setSuccess('เพิ่มวัสดุสำเร็จ');
      setIsDialogOpen(false);
      await fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มวัสดุ'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: MaterialFormData) => {
    if (!editingMaterial) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/stock/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
        throw new Error(errorData.error || 'Failed to update material');
      }

      setSuccess('อัปเดตวัสดุสำเร็จ');
      setIsDialogOpen(false);
      setEditingMaterial(null);
      await fetchMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตวัสดุ'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบวัสดุนี้?')) return;

    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/stock/materials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete material');
      }

      setSuccess('ลบวัสดุสำเร็จ');
      await fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบวัสดุ'
      );
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when closing
      setEditingMaterial(null);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการวัสดุ</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข และลบข้อมูลวัสดุ</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMaterial(null)}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มวัสดุ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'แก้ไขวัสดุ' : 'เพิ่มวัสดุใหม่'}
              </DialogTitle>
            </DialogHeader>
            {(error || success) && (
              <Alert variant={error ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error || success}</AlertDescription>
              </Alert>
            )}
            <MaterialForm
              defaultValues={
                editingMaterial
                  ? {
                      name: editingMaterial.name,
                      unit: editingMaterial.unit,
                      current_stock: Number(editingMaterial.current_stock),
                      min_stock_alert: Number(editingMaterial.min_stock_alert),
                    }
                  : undefined
              }
              onSubmit={editingMaterial ? handleUpdate : handleCreate}
              onCancel={() => handleDialogOpenChange(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && !isDialogOpen && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && !isDialogOpen && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>รายการวัสดุ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีข้อมูลวัสดุ
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อวัสดุ</TableHead>
                  <TableHead>หน่วย</TableHead>
                  <TableHead>สต็อกปัจจุบัน</TableHead>
                  <TableHead>จุดแจ้งเตือน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => {
                  const isLowStock =
                    material.min_stock_alert !== null &&
                    material.current_stock <= material.min_stock_alert;

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        {material.name}
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{material.current_stock.toLocaleString('th-TH')}</span>
                          {isLowStock && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              ต่ำ
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {material.min_stock_alert !== null
                          ? material.min_stock_alert.toLocaleString('th-TH')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(material)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(material.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

