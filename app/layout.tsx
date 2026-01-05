import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ระบบจัดการสต็อกวัสดุก่อสร้าง',
  description: 'ระบบจัดการสต็อกวัสดุก่อสร้างและเงินเดือนพนักงาน',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
