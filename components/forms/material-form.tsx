'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialSchema, type MaterialFormData } from '@/lib/validations/stock';
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

interface MaterialFormProps {
  defaultValues?: Partial<MaterialFormData>;
  onSubmit: (data: MaterialFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MaterialForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: MaterialFormProps) {
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      unit: defaultValues?.unit ?? '',
      current_stock: defaultValues?.current_stock ?? 0,
      min_stock_alert: defaultValues?.min_stock_alert,
    },
  });

  const handleSubmit = async (data: MaterialFormData) => {
    try {
      await onSubmit(data);
      // Only reset form if submission is successful
      // The parent component will handle closing dialog and refreshing data
      if (!defaultValues?.name) {
        // Reset form only for create mode
        form.reset({
          name: '',
          unit: '',
          current_stock: 0,
          min_stock_alert: undefined,
        });
      }
    } catch (error) {
      // Don't reset form on error - let user see the error and fix it
      console.error('Error submitting form:', error);
      // Re-throw error so parent component can handle it
      throw error;
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
              <FormLabel>ชื่อวัสดุ *</FormLabel>
              <FormControl>
                <Input placeholder="เช่น หิน, ดิน, ทราย" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หน่วย *</FormLabel>
              <FormControl>
                <Input placeholder="เช่น คิว, ตัน, ลบ.ม." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="current_stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>สต็อกปัจจุบัน</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  disabled={!!defaultValues?.name}
                  {...field}
                />
              </FormControl>
              {defaultValues?.name && (
                <p className="text-sm text-muted-foreground">
                  ⚠️ สต็อกปัจจุบันจะถูกคำนวณอัตโนมัติจากประวัติการทำธุรกรรม
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="min_stock_alert"
          render={({ field }) => (
            <FormItem>
              <FormLabel>จุดแจ้งเตือนสต็อกต่ำ</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="เช่น 10"
                  {...field}
                />
              </FormControl>
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

