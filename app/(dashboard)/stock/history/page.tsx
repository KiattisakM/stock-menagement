'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Material {
  id: number;
  name: string;
  unit: string;
}

interface StockIn {
  id: number;
  material_id: number;
  quantity: number;
  unit_price: number | null;
  supplier: string | null;
  note: string | null;
  transaction_date: string;
  material: Material;
}

interface StockOut {
  id: number;
  material_id: number;
  quantity: number;
  customer_name: string | null;
  project_name: string | null;
  note: string | null;
  transaction_date: string;
  material: Material;
}

export default function StockHistoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedMaterialId, startDate, endDate, activeTab]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/stock/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (selectedMaterialId !== 'all') {
        params.append('material_id', selectedMaterialId);
      }
      if (startDate) {
        // Set start date to beginning of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        params.append('start_date', start.toISOString());
      }
      if (endDate) {
        // Set end date to end of day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append('end_date', end.toISOString());
      }

      if (activeTab === 'all' || activeTab === 'in') {
        const stockInResponse = await fetch(`/api/stock/in?${params.toString()}`);
        if (stockInResponse.ok) {
          const stockInData = await stockInResponse.json();
          setStockIns(stockInData);
        }
      } else {
        // Clear stock ins if not needed
        setStockIns([]);
      }

      if (activeTab === 'all' || activeTab === 'out') {
        const stockOutResponse = await fetch(`/api/stock/out?${params.toString()}`);
        if (stockOutResponse.ok) {
          const stockOutData = await stockOutResponse.json();
          setStockOuts(stockOutData);
        }
      } else {
        // Clear stock outs if not needed
        setStockOuts([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedMaterialId('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasFilters = selectedMaterialId !== 'all' || startDate || endDate;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ประวัติสต็อก</h1>
        <p className="text-gray-500">ดูประวัติการรับ-จ่ายวัสดุ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">วัสดุ</label>
              <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">วันที่เริ่มต้น</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">วันที่สิ้นสุด</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'เลือกวันที่'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {hasFilters && (
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการทำธุรกรรม</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'in' | 'out')}>
            <TabsList>
              <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
              <TabsTrigger value="in">สต็อกเข้า</TabsTrigger>
              <TabsTrigger value="out">สต็อกออก</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="text-center py-8">กำลังโหลด...</div>
              ) : (
                <div className="space-y-6">
                  {stockIns.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">สต็อกเข้า</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>วัสดุ</TableHead>
                            <TableHead>จำนวน</TableHead>
                            <TableHead>ราคาต่อหน่วย</TableHead>
                            <TableHead>ผู้จำหน่าย</TableHead>
                            <TableHead>หมายเหตุ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockIns.map((item) => (
                            <TableRow key={`in-${item.id}`}>
                              <TableCell>
                                {format(new Date(item.transaction_date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>{item.material.name}</TableCell>
                              <TableCell>
                                {item.quantity.toLocaleString('th-TH')} {item.material.unit}
                              </TableCell>
                              <TableCell>
                                {item.unit_price
                                  ? `฿${item.unit_price.toLocaleString('th-TH')}`
                                  : '-'}
                              </TableCell>
                              <TableCell>{item.supplier || '-'}</TableCell>
                              <TableCell>{item.note || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {stockOuts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">สต็อกออก</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>วันที่</TableHead>
                            <TableHead>วัสดุ</TableHead>
                            <TableHead>จำนวน</TableHead>
                            <TableHead>ลูกค้า</TableHead>
                            <TableHead>โครงการ</TableHead>
                            <TableHead>หมายเหตุ</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockOuts.map((item) => (
                            <TableRow key={`out-${item.id}`}>
                              <TableCell>
                                {format(new Date(item.transaction_date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>{item.material.name}</TableCell>
                              <TableCell>
                                {item.quantity.toLocaleString('th-TH')} {item.material.unit}
                              </TableCell>
                              <TableCell>{item.customer_name || '-'}</TableCell>
                              <TableCell>{item.project_name || '-'}</TableCell>
                              <TableCell>{item.note || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {stockIns.length === 0 && stockOuts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      ไม่พบข้อมูลการทำธุรกรรม
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in" className="mt-4">
              {isLoading ? (
                <div className="text-center py-8">กำลังโหลด...</div>
              ) : stockIns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลสต็อกเข้า
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>วัสดุ</TableHead>
                      <TableHead>จำนวน</TableHead>
                      <TableHead>ราคาต่อหน่วย</TableHead>
                      <TableHead>ผู้จำหน่าย</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockIns.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.transaction_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{item.material.name}</TableCell>
                        <TableCell>
                          {item.quantity} {item.material.unit}
                        </TableCell>
                        <TableCell>
                          {item.unit_price
                            ? `฿${item.unit_price.toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell>{item.supplier || '-'}</TableCell>
                        <TableCell>{item.note || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="out" className="mt-4">
              {isLoading ? (
                <div className="text-center py-8">กำลังโหลด...</div>
              ) : stockOuts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  ไม่พบข้อมูลสต็อกออก
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>วัสดุ</TableHead>
                      <TableHead>จำนวน</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>โครงการ</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockOuts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.transaction_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{item.material.name}</TableCell>
                        <TableCell>
                          {item.quantity} {item.material.unit}
                        </TableCell>
                        <TableCell>{item.customer_name || '-'}</TableCell>
                        <TableCell>{item.project_name || '-'}</TableCell>
                        <TableCell>{item.note || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

