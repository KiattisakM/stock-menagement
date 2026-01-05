/**
 * Test Script for Use Cases from project-documentation.md
 * 
 * Use Case 1: รับสต็อกหินเข้า
 * Use Case 2: บันทึกการวิ่งงาน
 * Use Case 3: คำนวณเงินเดือนประจำเดือน
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test data
let testMaterialId: number;
let testEmployeeId: number;
let testMaterialInitialStock = 30;

async function setupTestData() {
  logSection('Setup Test Data');

  // Ensure admin user exists
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: '$2b$10$dummy', // Dummy hash for testing
      name: 'ผู้ดูแลระบบ',
      role: 'admin',
    },
  });
  logInfo(`Admin user: ${admin.email}`);

  // Create or get material "หินฝุ่น" with initial stock = 30
  let material = await prisma.material.findFirst({
    where: { name: 'หินฝุ่น' },
  });

  if (!material) {
    material = await prisma.material.create({
      data: {
        name: 'หินฝุ่น',
        unit: 'ตัน',
        current_stock: testMaterialInitialStock,
        min_stock_alert: 10,
      },
    });
  } else {
    material = await prisma.material.update({
      where: { id: material.id },
      data: {
        current_stock: testMaterialInitialStock,
        min_stock_alert: 10,
      },
    });
  }
  testMaterialId = material.id;
  logSuccess(`Material "หินฝุ่น" created/updated: ID=${material.id}, Stock=${material.current_stock}`);

  // Create or get material "ทรายหยาบ" for Use Case 2
  let sandMaterial = await prisma.material.findFirst({
    where: { name: 'ทรายหยาบ' },
  });

  if (!sandMaterial) {
    sandMaterial = await prisma.material.create({
      data: {
        name: 'ทรายหยาบ',
        unit: 'คิว',
        current_stock: 30,
        min_stock_alert: 5,
      },
    });
  }
  logInfo(`Material "ทรายหยาบ": ID=${sandMaterial.id}`);

  // Find employee by name if exists
  let testEmployee = await prisma.employee.findFirst({
    where: { name: 'สมชาย' },
  });

  if (!testEmployee) {
    testEmployee = await prisma.employee.create({
      data: {
        name: 'สมชาย',
        truck_license: 'กข-1234',
        base_salary: 0,
        rate_per_trip: 500,
        status: 'active',
      },
    });
  } else {
    // Update to ensure correct values
    testEmployee = await prisma.employee.update({
      where: { id: testEmployee.id },
      data: {
        base_salary: 0,
        rate_per_trip: 500,
        status: 'active',
      },
    });
  }

  testEmployeeId = testEmployee.id;
  logSuccess(`Employee "สมชาย" created/updated: ID=${testEmployee.id}, Rate=${testEmployee.rate_per_trip}`);

  // Clean up old test data for January 2026
  const jan2026 = { month: 1, year: 2026 };
  await prisma.salarySummary.deleteMany({
    where: {
      employee_id: testEmployeeId,
      ...jan2026,
    },
  });
  await prisma.trip.deleteMany({
    where: {
      employee_id: testEmployeeId,
      trip_date: {
        gte: new Date(2026, 0, 1),
        lte: new Date(2026, 0, 31, 23, 59, 59),
      },
    },
  });
  await prisma.advance.deleteMany({
    where: {
      employee_id: testEmployeeId,
      advance_date: {
        gte: new Date(2026, 0, 1),
        lte: new Date(2026, 0, 31, 23, 59, 59),
      },
    },
  });
  logInfo('Cleaned up old test data for January 2026');
}

async function testUseCase1() {
  logSection('Use Case 1: รับสต็อกหินเข้า');

  logInfo('Step 1: เข้าหน้า "บันทึกสต็อกเข้า"');
  logInfo('Step 2: เลือกวัสดุ: "หินฝุ่น"');
  logInfo('Step 3: กรอกจำนวน: 20 ตัน');
  logInfo('Step 4: กรอกราคา: 15,000 บาท (750 บาท/ตัน)');
  logInfo('Step 5: กรอกผู้ส่ง: "บริษัท ABC"');
  logInfo('Step 6: กดบันทึก');

  // Get current stock before
  const materialBefore = await prisma.material.findUnique({
    where: { id: testMaterialId },
  });
  const stockBefore = materialBefore?.current_stock.toNumber() || 0;
  logInfo(`Current stock before: ${stockBefore} ตัน`);

  // Create stock in transaction
  const stockIn = await prisma.$transaction(async (tx) => {
    const stockInRecord = await tx.stockIn.create({
      data: {
        material_id: testMaterialId,
        quantity: 20,
        unit_price: 750,
        supplier: 'บริษัท ABC',
        transaction_date: new Date(),
      },
    });

    await tx.material.update({
      where: { id: testMaterialId },
      data: {
        current_stock: {
          increment: 20,
        },
      },
    });

    return stockInRecord;
  });

  logSuccess(`Stock in record created: ID=${stockIn.id}`);

  // Verify stock updated
  const materialAfter = await prisma.material.findUnique({
    where: { id: testMaterialId },
  });
  const stockAfter = materialAfter?.current_stock.toNumber() || 0;
  logInfo(`Current stock after: ${stockAfter} ตัน`);

  // Verify results
  const expectedStock = stockBefore + 20;
  if (stockAfter === expectedStock) {
    logSuccess(`✅ Stock updated correctly: ${stockBefore} → ${stockAfter} ตัน`);
  } else {
    logError(`❌ Stock update failed: Expected ${expectedStock}, got ${stockAfter}`);
    throw new Error('Stock update verification failed');
  }

  // Verify stock_in record exists
  const stockInRecord = await prisma.stockIn.findUnique({
    where: { id: stockIn.id },
    include: { material: true },
  });
  if (stockInRecord && stockInRecord.material.name === 'หินฝุ่น') {
    logSuccess('✅ Stock in record verified');
  } else {
    logError('❌ Stock in record verification failed');
    throw new Error('Stock in record verification failed');
  }

  logSuccess('Use Case 1: PASSED ✅');
}

async function testUseCase2() {
  logSection('Use Case 2: บันทึกการวิ่งงาน');

  logInfo('Step 1: เข้าหน้า "บันทึกการวิ่งงาน"');
  logInfo('Step 2: เลือกพนักงาน: "สมชาย"');
  logInfo('Step 3: กรอกวันที่: "วันนี้"');
  logInfo('Step 4: กรอกเส้นทาง: "กรุงเทพ - ชลบุรี"');
  logInfo('Step 5: เลือกวัสดุ: "ทรายหยาบ"');
  logInfo('Step 6: ค่าเที่ยว: 500 บาท (auto-fill)');
  logInfo('Step 7: กดบันทึก');

  // Get employee rate
  const employee = await prisma.employee.findUnique({
    where: { id: testEmployeeId },
  });
  const ratePerTrip = employee?.rate_per_trip.toNumber() || 500;
  logInfo(`Employee rate per trip: ${ratePerTrip} บาท`);

  // Get sand material
  const sandMaterial = await prisma.material.findFirst({
    where: { name: 'ทรายหยาบ' },
  });
  if (!sandMaterial) {
    throw new Error('Material "ทรายหยาบ" not found');
  }

  // Create trip record
  const trip = await prisma.trip.create({
    data: {
      employee_id: testEmployeeId,
      trip_date: new Date(),
      route: 'กรุงเทพ - ชลบุรี',
      material_id: sandMaterial.id,
      quantity: null, // Optional
      rate: ratePerTrip,
      note: null,
    },
    include: {
      employee: true,
      material: true,
    },
  });

  logSuccess(`Trip record created: ID=${trip.id}`);
  logInfo(`Employee: ${trip.employee.name}`);
  logInfo(`Route: ${trip.route}`);
  logInfo(`Rate: ${trip.rate} บาท`);

  // Verify trip record
  const tripRecord = await prisma.trip.findUnique({
    where: { id: trip.id },
    include: {
      employee: true,
      material: true,
    },
  });

  if (
    tripRecord &&
    tripRecord.employee.name === 'สมชาย' &&
    tripRecord.route === 'กรุงเทพ - ชลบุรี' &&
    tripRecord.rate.toNumber() === 500
  ) {
    logSuccess('✅ Trip record verified');
  } else {
    logError('❌ Trip record verification failed');
    throw new Error('Trip record verification failed');
  }

  logSuccess('Use Case 2: PASSED ✅');
}

async function testUseCase3() {
  logSection('Use Case 3: คำนวณเงินเดือนประจำเดือน');

  logInfo('Step 1: เข้าหน้า "คำนวณเงินเดือน"');
  logInfo('Step 2: เลือกเดือน: "มกราคม 2026"');
  logInfo('Step 3: กดปุ่ม "คำนวณ"');

  const month = 1; // January
  const year = 2026;

  // Clean up any trips from Use Case 2 that might be in January 2026
  const janStart = new Date(2026, 0, 1);
  const janEnd = new Date(2026, 0, 31, 23, 59, 59);
  await prisma.trip.deleteMany({
    where: {
      employee_id: testEmployeeId,
      trip_date: {
        gte: janStart,
        lte: janEnd,
      },
    },
  });
  logInfo('Cleaned up existing trips for January 2026');

  // Setup: Create 25 trips for January 2026
  logInfo('Setting up test data: Creating 25 trips for January 2026...');
  const trips = [];
  for (let i = 0; i < 25; i++) {
    const trip = await prisma.trip.create({
      data: {
        employee_id: testEmployeeId,
        trip_date: new Date(2026, 0, Math.min(i + 1, 31)), // Spread across January
        route: `เส้นทาง ${i + 1}`,
        rate: 500,
      },
    });
    trips.push(trip);
  }
  logSuccess(`Created ${trips.length} trips`);

  // Setup: Create advance payment of 3,000
  logInfo('Setting up test data: Creating advance payment of 3,000 บาท...');
  const advance = await prisma.advance.create({
    data: {
      employee_id: testEmployeeId,
      amount: 3000,
      advance_date: new Date(2026, 0, 15),
      note: 'เบิกเงินล่วงหน้า',
    },
  });
  logSuccess(`Created advance: ${advance.amount} บาท`);

  // Calculate salary
  logInfo('Calculating salary...');
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get trips
  const employeeTrips = await prisma.trip.findMany({
    where: {
      employee_id: testEmployeeId,
      trip_date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Get advances
  const employeeAdvances = await prisma.advance.findMany({
    where: {
      employee_id: testEmployeeId,
      advance_date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate totals
  const totalTripIncome = employeeTrips.reduce(
    (sum, trip) => sum + trip.rate.toNumber(),
    0
  );
  const totalAdvances = employeeAdvances.reduce(
    (sum, advance) => sum + advance.amount.toNumber(),
    0
  );

  // Get employee
  const employee = await prisma.employee.findUnique({
    where: { id: testEmployeeId },
  });
  const baseSalary = employee?.base_salary.toNumber() || 0;

  // Calculate net salary
  const netSalary = baseSalary + totalTripIncome - totalAdvances;

  logInfo(`Total trips: ${employeeTrips.length}`);
  logInfo(`Total trip income: ${totalTripIncome} บาท`);
  logInfo(`Total advances: ${totalAdvances} บาท`);
  logInfo(`Base salary: ${baseSalary} บาท`);
  logInfo(`Net salary: ${netSalary} บาท`);

  // Create salary summary
  const salarySummary = await prisma.salarySummary.upsert({
    where: {
      employee_id_month_year: {
        employee_id: testEmployeeId,
        month,
        year,
      },
    },
    update: {
      total_trips: employeeTrips.length,
      total_trip_income: totalTripIncome,
      total_advances: totalAdvances,
      base_salary: baseSalary,
      net_salary: netSalary,
    },
    create: {
      employee_id: testEmployeeId,
      month,
      year,
      total_trips: employeeTrips.length,
      total_trip_income: totalTripIncome,
      total_advances: totalAdvances,
      base_salary: baseSalary,
      net_salary: netSalary,
    },
    include: {
      employee: true,
    },
  });

  logSuccess(`Salary summary created: ID=${salarySummary.id}`);

  // Verify calculations
  const expectedTotalTrips = 25;
  const expectedTotalTripIncome = 25 * 500; // 12,500
  const expectedTotalAdvances = 3000;
  const expectedNetSalary = 0 + expectedTotalTripIncome - expectedTotalAdvances; // 9,500

  logInfo('Verifying calculations...');
  logInfo(`Expected total trips: ${expectedTotalTrips}, Got: ${salarySummary.total_trips}`);
  logInfo(`Expected total trip income: ${expectedTotalTripIncome}, Got: ${salarySummary.total_trip_income.toNumber()}`);
  logInfo(`Expected total advances: ${expectedTotalAdvances}, Got: ${salarySummary.total_advances.toNumber()}`);
  logInfo(`Expected net salary: ${expectedNetSalary}, Got: ${salarySummary.net_salary.toNumber()}`);

  if (
    salarySummary.total_trips === expectedTotalTrips &&
    salarySummary.total_trip_income.toNumber() === expectedTotalTripIncome &&
    salarySummary.total_advances.toNumber() === expectedTotalAdvances &&
    salarySummary.net_salary.toNumber() === expectedNetSalary
  ) {
    logSuccess('✅ Salary calculation verified');
  } else {
    logError('❌ Salary calculation verification failed');
    throw new Error('Salary calculation verification failed');
  }

  logInfo('Step 4: กดปุ่ม "พิมพ์สลิปเงินเดือน"');
  logInfo('→ ระบบสร้างไฟล์ PDF');
  logInfo('→ ดาวน์โหลดอัตโนมัติ');
  logWarning('(PDF generation test skipped - requires browser/PDF library)');

  logSuccess('Use Case 3: PASSED ✅');
}

async function cleanup() {
  logSection('Cleanup');
  logInfo('Cleaning up test data...');
  
  // Note: We keep the test data for manual inspection
  // Uncomment below to delete test data
  /*
  await prisma.salarySummary.deleteMany({
    where: {
      employee_id: testEmployeeId,
      month: 1,
      year: 2026,
    },
  });
  await prisma.trip.deleteMany({
    where: {
      employee_id: testEmployeeId,
    },
  });
  await prisma.advance.deleteMany({
    where: {
      employee_id: testEmployeeId,
    },
  });
  */
  
  logInfo('Test data kept for manual inspection');
}

async function main() {
  try {
    logSection('🧪 Use Case Testing Script');
    logInfo('Testing use cases from project-documentation.md\n');

    await setupTestData();
    await testUseCase1();
    await testUseCase2();
    await testUseCase3();
    await cleanup();

    logSection('🎉 All Tests Passed!');
    logSuccess('All use cases tested successfully ✅');
  } catch (error) {
    logError('Test failed!');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

