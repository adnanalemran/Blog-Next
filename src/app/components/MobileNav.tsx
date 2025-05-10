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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={`flex h-full flex-col items-center justify-center space-y-1 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-accent/50' 
                  : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 