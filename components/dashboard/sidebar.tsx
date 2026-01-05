'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'จัดการสต็อก',
    icon: Package,
    children: [
      { name: 'บันทึกสต็อกเข้า', href: '/stock/in' },
      { name: 'บันทึกสต็อกออก', href: '/stock/out' },
      { name: 'ประวัติสต็อก', href: '/stock/history' },
    ]
  },
  {
    name: 'จัดการพนักงาน',
    icon: Users,
    children: [
      { name: 'บันทึกการวิ่งงาน', href: '/employees/trips' },
      { name: 'คำนวณเงินเดือน', href: '/employees/salary' },
    ]
  },
  { name: 'รายงาน', href: '/reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">ระบบจัดการสต็อก</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-800',
                  pathname === item.href ? 'bg-gray-800' : ''
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.children && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm hover:bg-gray-800',
                          pathname === child.href ? 'bg-gray-800' : ''
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/login"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </Link>
      </div>
    </div>
  );
}
