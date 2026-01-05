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
import { EmployeeForm } from '@/components/forms/employee-form';
import { EmployeeFormData } from '@/lib/validations/employee';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Employee {
  id: number;
  name: string;
  truck_license: string | null;
  base_salary: number;
  rate_per_trip: number;
  status: 'active' | 'inactive';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      setSuccess('เพิ่มพนักงานสำเร็จ');
      setIsDialogOpen(false);
      await fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      setSuccess('อัปเดตพนักงานสำเร็จ');
      setIsDialogOpen(false);
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตพนักงาน'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานนี้?')) return;

    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }

      setSuccess('ลบพนักงานสำเร็จ');
      await fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบพนักงาน'
      );
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setError(null);
    setSuccess(null);
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
          <h1 className="text-3xl font-bold">จัดการพนักงาน</h1>
          <p className="text-gray-500">เพิ่ม แก้ไข และลบข้อมูลพนักงาน</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEmployee(null)}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}
              </DialogTitle>
            </DialogHeader>
            {(error || success) && (
              <Alert variant={error ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error || success}</AlertDescription>
              </Alert>
            )}
            <EmployeeForm
              defaultValues={
                editingEmployee
                  ? {
                      name: editingEmployee.name,
                      truck_license: editingEmployee.truck_license || undefined,
                      base_salary: editingEmployee.base_salary,
                      rate_per_trip: editingEmployee.rate_per_trip,
                      status: editingEmployee.status,
                    }
                  : undefined
              }
              onSubmit={editingEmployee ? handleUpdate : handleCreate}
              onCancel={handleDialogClose}
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
          <CardTitle>รายการพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">กำลังโหลด...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีข้อมูลพนักงาน
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อพนักงาน</TableHead>
                  <TableHead>ทะเบียนรถ</TableHead>
                  <TableHead>เงินเดือนฐาน</TableHead>
                  <TableHead>อัตราค่าเที่ยว</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.truck_license || '-'}</TableCell>
                    <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
                    <TableCell>{formatCurrency(employee.rate_per_trip)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                      >
                        {employee.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

