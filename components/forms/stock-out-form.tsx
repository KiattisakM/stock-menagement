'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockOutSchema, type StockOutFormData } from '@/lib/validations/stock';
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

interface StockOutFormProps {
  materials: Material[];
  onSubmit: (data: StockOutFormData) => Promise<void>;
  isLoading?: boolean;
}

export function StockOutForm({
  materials,
  onSubmit,
  isLoading = false,
}: StockOutFormProps) {
  const form = useForm<StockOutFormData>({
    resolver: zodResolver(stockOutSchema),
    defaultValues: {
      material_id: undefined,
      quantity: undefined,
      customer_name: '',
      project_name: '',
      note: '',
      transaction_date: new Date(),
    },
  });

  const handleSubmit = async (data: StockOutFormData) => {
    // Client-side validation: Check if quantity exceeds current stock
    if (selectedMaterial && data.quantity > selectedMaterial.current_stock) {
      form.setError('quantity', {
        type: 'manual',
        message: `จำนวนที่กรอกเกินสต็อกคงเหลือ (คงเหลือ: ${selectedMaterial.current_stock.toLocaleString('th-TH')} ${selectedMaterial.unit})`,
      });
      return;
    }

    try {
      await onSubmit(data);
      form.reset({
        material_id: undefined,
        quantity: undefined,
        customer_name: '',
        project_name: '',
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
                  max={selectedMaterial?.current_stock}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange(undefined);
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        // Clear error if quantity is valid
                        if (selectedMaterial && numValue <= selectedMaterial.current_stock) {
                          form.clearErrors('quantity');
                        }
                        field.onChange(numValue);
                      } else {
                        field.onChange(undefined);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    // Validate on blur
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && selectedMaterial && value > selectedMaterial.current_stock) {
                      form.setError('quantity', {
                        type: 'manual',
                        message: `จำนวนที่กรอกเกินสต็อกคงเหลือ (คงเหลือ: ${selectedMaterial.current_stock.toLocaleString('th-TH')} ${selectedMaterial.unit})`,
                      });
                    }
                  }}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              {selectedMaterial && (
                <p className="text-sm text-muted-foreground">
                  สต็อกคงเหลือ: {selectedMaterial.current_stock.toLocaleString('th-TH')}{' '}
                  {selectedMaterial.unit}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อลูกค้า</FormLabel>
              <FormControl>
                <Input placeholder="ชื่อลูกค้า" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ชื่อโครงการ</FormLabel>
              <FormControl>
                <Input placeholder="ชื่อโครงการ" {...field} />
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
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกสต็อกออก'}
        </Button>
      </form>
    </Form>
  );
}

