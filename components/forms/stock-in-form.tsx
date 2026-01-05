'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockInSchema, type StockInFormData } from '@/lib/validations/stock';
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

interface Material {
  id: number;
  name: string;
  unit: string;
  current_stock: number;
}

interface StockInFormProps {
  materials: Material[];
  onSubmit: (data: StockInFormData) => Promise<void>;
  isLoading?: boolean;
}

export function StockInForm({
  materials,
  onSubmit,
  isLoading = false,
}: StockInFormProps) {
  const form = useForm<StockInFormData>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      material_id: undefined,
      quantity: undefined,
      unit_price: undefined,
      supplier: '',
      note: '',
      transaction_date: new Date(),
    },
  });

  const handleSubmit = async (data: StockInFormData) => {
    try {
      await onSubmit(data);
      form.reset({
        material_id: undefined,
        quantity: undefined,
        unit_price: undefined,
        supplier: '',
        note: '',
        transaction_date: new Date(),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const selectedMaterialId = form.watch('material_id');
  const selectedMaterial = materials.find(
    (m) => m.id === selectedMaterialId
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="material_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>วัสดุ *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกวัสดุ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name} ({material.unit}) - คงเหลือ:{' '}
                      {material.current_stock.toLocaleString('th-TH')}
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                จำนวน *{' '}
                {selectedMaterial && `(${selectedMaterial.unit})`}
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
          )}
        />

        <FormField
          control={form.control}
          name="unit_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ราคาต่อหน่วย (บาท)</FormLabel>
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
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ผู้จำหน่าย</FormLabel>
              <FormControl>
                <Input placeholder="ชื่อผู้จำหน่าย" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>วันที่ทำธุรกรรม *</FormLabel>
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
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกสต็อกเข้า'}
        </Button>
      </form>
    </Form>
  );
}

