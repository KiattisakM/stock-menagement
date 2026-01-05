import { z } from 'zod';

// Stock In Schema
export const stockInSchema = z.object({
  material_id: z.number().int().positive('กรุณาเลือกวัสดุ'),
  quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
  unit_price: z.number().nonnegative('ราคาต้องมากกว่าหรือเท่ากับ 0').optional(),
  supplier: z.string().max(200, 'ชื่อผู้จำหน่ายต้องไม่เกิน 200 ตัวอักษร').optional(),
  note: z.string().optional(),
  transaction_date: z.date({
    message: 'กรุณาเลือกวันที่',
  }),
});

export type StockInFormData = z.infer<typeof stockInSchema>;

// Stock Out Schema
export const stockOutSchema = z.object({
  material_id: z.number().int().positive('กรุณาเลือกวัสดุ'),
  quantity: z.number().positive('จำนวนต้องมากกว่า 0'),
  customer_name: z.string().max(200, 'ชื่อลูกค้าต้องไม่เกิน 200 ตัวอักษร').optional(),
  project_name: z.string().max(200, 'ชื่อโครงการต้องไม่เกิน 200 ตัวอักษร').optional(),
  note: z.string().optional(),
  transaction_date: z.date({
    message: 'กรุณาเลือกวันที่',
  }),
});

export type StockOutFormData = z.infer<typeof stockOutSchema>;

// Material Schema
export const materialSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อวัสดุ').max(100, 'ชื่อวัสดุต้องไม่เกิน 100 ตัวอักษร'),
  unit: z.string().min(1, 'กรุณากรอกหน่วย').max(20, 'หน่วยต้องไม่เกิน 20 ตัวอักษร'),
  current_stock: z.number().nonnegative('สต็อกปัจจุบันต้องมากกว่าหรือเท่ากับ 0'),
  min_stock_alert: z.number().nonnegative('จุดแจ้งเตือนต้องมากกว่าหรือเท่ากับ 0').optional(),
});

export type MaterialFormData = z.infer<typeof materialSchema>;

