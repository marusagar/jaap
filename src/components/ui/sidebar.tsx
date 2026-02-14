'use client';

import * as React from 'react';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import { ChevronsLeft, ChevronsRight, PanelLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { LotusIcon } from '../icons';
import type { User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
      <aside
        ref={ref}
        className={cn(
          'hidden lg:flex flex-col border-r transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
        {...props}
      />
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-14 items-center justify-between border-b lg:h-[60px]',
          isCollapsed ? 'justify-center px-2' : 'px-4',
          className
        )}
        {...props}
      />
    );
  }
);
SidebarHeader.displayName = 'SidebarHeader';

export function SidebarBrand({ href }: { href: string }) {
  const { isCollapsed } = useSidebar();
  return (
    <Link href={href} className="flex items-center gap-2 font-bold">
      <LotusIcon className="h-7 w-7 text-primary" />
      {!isCollapsed && <span className="font-headline text-lg">JapCounter Pro</span>}
    </Link>
  );
}

export function SidebarCollapse({ className }: { className?: string }) {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('hidden lg:flex', className)}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto py-2', className)} {...props} />
  )
);
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return (
        <div ref={ref} className={cn('mt-auto border-t', isCollapsed ? 'p-1' : 'p-2', className)} {...props} />
    )
});
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLUListElement>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar();
    return <ul ref={ref} className={cn('space-y-1', isCollapsed ? 'px-1' : 'px-2', className)} {...props} />;
  }
);
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  (props, ref) => <li ref={ref} {...props} />
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

export function SidebarMenuButton({
  href,
  isActive,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  isActive: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { isCollapsed } = useSidebar();
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary',
        isCollapsed && 'justify-center'
      )}
    >
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span className="flex-1 truncate">{children}</span>}
      {isCollapsed && <span className="sr-only">{children}</span>}
    </Link>
  );
}

export function SidebarActionButton({
  icon: Icon,
  children,
  onClick,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { isCollapsed } = useSidebar();
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full',
        isCollapsed && 'justify-center'
      )}
    >
      <Icon className="h-5 w-5" />
      {!isCollapsed && <span className="flex-1 truncate text-left">{children}</span>}
      {isCollapsed && <span className="sr-only">{children}</span>}
    </button>
  );
}

export function SidebarProfile({ user }: { user: User }) {
    const { isCollapsed } = useSidebar();

    const getInitials = (email: string | null) => {
        if (!email) return '..';
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <div className={cn(
            'flex items-center gap-3 text-left w-full',
            isCollapsed && 'justify-center'
        )}>
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User avatar'} />
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{user.email}</p>
                </div>
            )}
        </div>
    );
}

export function SidebarTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, setIsOpen } = useSidebar();

  const handleLinkClick = () => setIsOpen(false);

  // Clone children to pass down the onClick handler
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        // @ts-ignore
      return React.cloneElement(child, { onLinkClick: handleLinkClick });
    }
    return child;
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={cn('shrink-0 lg:hidden', className)}>
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0 w-64">
        <SheetTitle>Navigation Menu</SheetTitle>
        <SidebarHeader className="justify-start px-4">
          <SidebarBrand href="/app" />
        </SidebarHeader>
        <SidebarContent>
          {childrenWithProps}
        </SidebarContent>
      </SheetContent>
    </Sheet>
  );
}
