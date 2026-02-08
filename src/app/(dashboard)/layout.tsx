import { requireAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Store, ShoppingCart, Users, LayoutDashboard, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    redirect('/auth/login');
  }

  const isAdmin = user.role === 'SUPER_ADMIN';
  const isStoreOwner = user.role === 'STORE_OWNER' || user.role === 'SUPER_ADMIN';

  const navigation = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Stores', href: '/admin/stores', icon: Store },
        { name: 'Coupons', href: '/admin/coupons', icon: ShoppingCart },
      ]
    : isStoreOwner
    ? [
        { name: 'Dashboard', href: '/store-owner', icon: LayoutDashboard },
        { name: 'My Stores', href: '/store-owner/stores', icon: Store },
        { name: 'My Coupons', href: '/store-owner/coupons', icon: ShoppingCart },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold">Kobonz</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="ml-3 flex-shrink-0 p-2 rounded-md hover:bg-accent"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
