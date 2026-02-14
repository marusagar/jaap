'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarBrand,
  SidebarProfile,
  SidebarCollapse,
} from '@/components/ui/sidebar';
import { Home, Settings, History, LogOut, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NavItems } from './nav-items';

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Counter', icon: Home },
    { href: '/dashboard/history', label: 'History', icon: History },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <SidebarBrand href="/dashboard" />
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarContent>
            <NavItems items={navItems} />
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full rounded-lg hover:bg-muted p-1">
                  <SidebarProfile user={user} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger>
              <NavItems items={navItems} />
            </SidebarTrigger>
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold md:text-xl font-headline">
                {navItems.find((item) => item.href === pathname)?.label}
              </h1>
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 bg-muted/40">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
