'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { Home, BookOpen, User } from 'lucide-react';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/my-blogs',
      label: 'My Blogs',
      icon: BookOpen,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={`flex h-full flex-col items-center justify-center space-y-1 px-3 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 