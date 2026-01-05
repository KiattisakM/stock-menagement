import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'admin',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create initial materials
  const materials = await prisma.material.createMany({
    data: [
      {
        name: 'หินฝุ่น',
        unit: 'ตัน',
        current_stock: 0,
        min_stock_alert: 10,
      },
      {
        name: 'ทรายหยาบ',
        unit: 'คิว',
        current_stock: 0,
        min_stock_alert: 5,
      },
      {
        name: 'ดินถม',
        unit: 'ตัน',
        current_stock: 0,
        min_stock_alert: 8,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created materials:', materials.count);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
