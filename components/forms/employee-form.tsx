'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormData } from '@/lib/validations/employee';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: EmployeeFormProps) {
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      truck_license: defaultValues?.truck_license,
      base_salary: defaultValues?.base_salary ?? 0,
      rate_per_trip: defaultValues?.rate_per_trip ?? 0,
      status: defaultValues?.status ?? 'active',
    },
  });

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อพนักงาน *</FormLabel>
              <FormControl>
                <Input placeholder="เช่น สมชาย ใจดี" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="truck_license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ทะเบียนรถ</FormLabel>
              <FormControl>
                <Input placeholder="เช่น กข 1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เงินเดือนฐาน *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rate_per_trip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อัตราค่าเที่ยว *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>สถานะ *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

