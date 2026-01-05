'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripSchema, type TripFormData } from '@/lib/validations/employee';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  rate_per_trip: number;
}

interface Material {
  id: number;
  name: string;
  unit: string;
}

interface TripFormProps {
  employees: Employee[];
  materials?: Material[];
  onSubmit: (data: TripFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TripForm({
  employees,
  materials = [],
  onSubmit,
  isLoading = false,
}: TripFormProps) {
  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      employee_id: undefined,
      trip_date: new Date(),
      route: '',
      material_id: undefined,
      quantity: undefined,
      rate: undefined,
      note: '',
    },
  });

  const selectedEmployeeId = form.watch('employee_id');
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Auto-fill rate_per_trip when employee is selected
  useEffect(() => {
    if (selectedEmployee && !form.getValues('rate')) {
      form.setValue('rate', selectedEmployee.rate_per_trip);
    }
  }, [selectedEmployee, form]);

  const handleSubmit = async (data: TripFormData) => {
    try {
      await onSubmit(data);
      form.reset({
        employee_id: undefined,
        trip_date: new Date(),
        route: '',
        material_id: undefined,
        quantity: undefined,
        rate: selectedEmployee?.rate_per_trip,
        note: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>พนักงาน *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  // Reset rate when employee changes
                  const employee = employees.find((e) => e.id === parseInt(value));
                  if (employee) {
                    form.setValue('rate', employee.rate_per_trip);
                  }
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกพนักงาน" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} (อัตรา: {employee.rate_per_trip.toLocaleString()} บาท)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trip_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>วันที่วิ่งงาน *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>เลือกวันที่</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="route"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เส้นทาง</FormLabel>
              <FormControl>
                <Input placeholder="เช่น กรุงเทพ-ชลบุรี" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {materials.length > 0 && (
          <FormField
            control={form.control}
            name="material_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>วัสดุ (ไม่บังคับ)</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : parseInt(value))
                  }
                  value={field.value?.toString() || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกวัสดุ (ไม่บังคับ)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id.toString()}>
                        {material.name} ({material.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch('material_id') && (
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => {
              const selectedMaterial = materials.find(
                (m) => m.id === form.watch('material_id')
              );
              return (
                <FormItem>
                  <FormLabel>
                    จำนวน {selectedMaterial && `(${selectedMaterial.unit})`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange(undefined);
                        } else {
                          const numValue = parseFloat(value);
                          field.onChange(isNaN(numValue) ? undefined : numValue);
                        }
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ค่าเที่ยว (บาท) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={selectedEmployee?.rate_per_trip.toString() || '0'}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange(undefined);
                    } else {
                      const numValue = parseFloat(value);
                      field.onChange(isNaN(numValue) ? undefined : numValue);
                    }
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
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมายเหตุ</FormLabel>
              <FormControl>
                <Input placeholder="หมายเหตุเพิ่มเติม" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกการวิ่งงาน'}
        </Button>
      </form>
    </Form>
  );
}

