import ExcelJS from 'exceljs';

/**
 * Export stock data to Excel
 */
export async function exportStockToExcel(data: {
  materials: Array<{
    name: string;
    unit: string;
    current_stock: number;
    min_stock_alert: number | null;
  }>;
  stockIns?: Array<{
    date: string;
    materialName: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    supplier?: string;
  }>;
  stockOuts?: Array<{
    date: string;
    materialName: string;
    quantity: number;
    unit: string;
    customerName?: string;
    projectName?: string;
  }>;
}): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Materials sheet
  const materialsSheet = workbook.addWorksheet('วัสดุ');
  materialsSheet.columns = [
    { header: 'ชื่อวัสดุ', key: 'name', width: 30 },
    { header: 'หน่วย', key: 'unit', width: 15 },
    { header: 'สต็อกปัจจุบัน', key: 'current_stock', width: 20 },
    { header: 'จุดแจ้งเตือน', key: 'min_stock_alert', width: 20 },
  ];

  data.materials.forEach((material) => {
    materialsSheet.addRow({
      name: material.name,
      unit: material.unit,
      current_stock: material.current_stock,
      min_stock_alert: material.min_stock_alert ?? '-',
    });
  });

  // Stock In sheet
  if (data.stockIns && data.stockIns.length > 0) {
    const stockInSheet = workbook.addWorksheet('สต็อกเข้า');
    stockInSheet.columns = [
      { header: 'วันที่', key: 'date', width: 15 },
      { header: 'วัสดุ', key: 'materialName', width: 30 },
      { header: 'จำนวน', key: 'quantity', width: 15 },
      { header: 'หน่วย', key: 'unit', width: 15 },
      { header: 'ราคาต่อหน่วย', key: 'unitPrice', width: 20 },
      { header: 'ผู้จำหน่าย', key: 'supplier', width: 30 },
    ];

    data.stockIns.forEach((item) => {
      stockInSheet.addRow({
        date: new Date(item.date).toLocaleDateString('th-TH'),
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice ?? '-',
        supplier: item.supplier ?? '-',
      });
    });
  }

  // Stock Out sheet
  if (data.stockOuts && data.stockOuts.length > 0) {
    const stockOutSheet = workbook.addWorksheet('สต็อกออก');
    stockOutSheet.columns = [
      { header: 'วันที่', key: 'date', width: 15 },
      { header: 'วัสดุ', key: 'materialName', width: 30 },
      { header: 'จำนวน', key: 'quantity', width: 15 },
      { header: 'หน่วย', key: 'unit', width: 15 },
      { header: 'ลูกค้า', key: 'customerName', width: 30 },
      { header: 'โครงการ', key: 'projectName', width: 30 },
    ];

    data.stockOuts.forEach((item) => {
      stockOutSheet.addRow({
        date: new Date(item.date).toLocaleDateString('th-TH'),
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        customerName: item.customerName ?? '-',
        projectName: item.projectName ?? '-',
      });
    });
  }

  return await workbook.xlsx.writeBuffer();
}

/**
 * Export salary data to Excel
 */
export async function exportSalaryToExcel(data: {
  month: number;
  year: number;
  salaries: Array<{
    employeeName: string;
    baseSalary: number;
    totalTrips: number;
    totalTripIncome: number;
    totalAdvances: number;
    netSalary: number;
    isPaid: boolean;
  }>;
}): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('เงินเดือน');

  const monthNames = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  // Header
  sheet.addRow([`สรุปเงินเดือน ${monthNames[data.month - 1]} ${data.year}`]);
  sheet.addRow([]);

  // Columns
  sheet.columns = [
    { header: 'ชื่อพนักงาน', key: 'employeeName', width: 30 },
    { header: 'เงินเดือนฐาน', key: 'baseSalary', width: 20 },
    { header: 'จำนวนเที่ยว', key: 'totalTrips', width: 15 },
    { header: 'รายได้จากเที่ยว', key: 'totalTripIncome', width: 20 },
    { header: 'เบิกเงินล่วงหน้า', key: 'totalAdvances', width: 20 },
    { header: 'เงินเดือนสุทธิ', key: 'netSalary', width: 20 },
    { header: 'สถานะ', key: 'isPaid', width: 15 },
  ];

  // Data rows
  data.salaries.forEach((salary) => {
    sheet.addRow({
      employeeName: salary.employeeName,
      baseSalary: salary.baseSalary,
      totalTrips: salary.totalTrips,
      totalTripIncome: salary.totalTripIncome,
      totalAdvances: salary.totalAdvances,
      netSalary: salary.netSalary,
      isPaid: salary.isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย',
    });
  });

  // Total row
  const totalNetSalary = data.salaries.reduce(
    (sum, s) => sum + s.netSalary,
    0
  );
  sheet.addRow([]);
  sheet.addRow([
    'รวมเงินเดือนสุทธิ',
    '',
    '',
    '',
    '',
    totalNetSalary,
    '',
  ]);

  // Format header row
  const headerRow = sheet.getRow(3);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  return await workbook.xlsx.writeBuffer();
}

