'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { advanceSchema, type AdvanceFormData } from '@/lib/validations/employee';
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

interface Employee {
  id: number;
  name: string;
}

interface AdvanceFormProps {
  employees: Employee[];
  onSubmit: (data: AdvanceFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AdvanceForm({
  employees,
  onSubmit,
  isLoading = false,
}: AdvanceFormProps) {
  const form = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      employee_id: undefined,
      amount: undefined,
      advance_date: new Date(),
      note: '',
    },
  });

  const handleSubmit = async (data: AdvanceFormData) => {
    try {
      await onSubmit(data);
      form.reset({
        employee_id: undefined,
        amount: undefined,
        advance_date: new Date(),
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
                onValueChange={(value) => field.onChange(parseInt(value))}
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
                      {employee.name}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>จำนวนเงิน (บาท) *</FormLabel>
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
          name="advance_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>วันที่เบิก *</FormLabel>
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
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกเบิกเงินล่วงหน้า'}
        </Button>
      </form>
    </Form>
  );
}

