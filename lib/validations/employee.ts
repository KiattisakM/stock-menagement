import { z } from 'zod';

// Employee Schema
export const employeeSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อพนักงาน').max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  truck_license: z.string().max(50, 'ทะเบียนรถต้องไม่เกิน 50 ตัวอักษร').optional(),
  base_salary: z.number().nonnegative('เงินเดือนฐานต้องมากกว่าหรือเท่ากับ 0').default(0),
  rate_per_trip: z.number().positive('อัตราค่าเที่ยวต้องมากกว่า 0'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// Trip Schema
export const tripSchema = z.object({
  employee_id: z.number().int().positive('กรุณาเลือกพนักงาน'),
  trip_date: z.date({
    message: 'กรุณาเลือกวันที่',
  }),
  route: z.string().max(200, 'เส้นทางต้องไม่เกิน 200 ตัวอักษร').optional(),
  material_id: z.number().int().positive().optional(),
  quantity: z.number().positive().optional(),
  rate: z.number().positive('ค่าเที่ยวต้องมากกว่า 0'),
  note: z.string().optional(),
});

export type TripFormData = z.infer<typeof tripSchema>;

// Advance Schema
export const advanceSchema = z.object({
  employee_id: z.number().int().positive('กรุณาเลือกพนักงาน'),
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  advance_date: z.date({
    message: 'กรุณาเลือกวันที่',
  }),
  note: z.string().optional(),
});

export type AdvanceFormData = z.infer<typeof advanceSchema>;

// Salary Calculation Schema
export const salaryCalculationSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export type SalaryCalculationFormData = z.infer<typeof salaryCalculationSchema>;

