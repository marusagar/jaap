
'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarActionButton } from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavItemsProps = {
  items: NavItem[];
  onLinkClick?: () => void;
  onLogoutClick?: () => void;
};

export function NavItems({ items, onLinkClick, onLogoutClick }: NavItemsProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    if (onLinkClick) {
      onLinkClick();
    }
    if (onLogoutClick) {
      onLogoutClick();
    }
  }

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            href={item.href}
            isActive={pathname === item.href}
            icon={item.icon}
            onClick={onLinkClick}
          >
            {item.label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      {onLogoutClick && (
        <SidebarMenuItem>
          <SidebarActionButton icon={LogOut} onClick={handleLogout}>
            Log Out
          </SidebarActionButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
