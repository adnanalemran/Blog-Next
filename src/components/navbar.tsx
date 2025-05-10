"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import {
  Home,
  BookOpen,
  LogIn,
  PlusCircle,
  Bell,
  MessageSquare,
} from "lucide-react";
import { UserNav } from "./user-nav";

export function Navbar() {
  const pathname = usePathname();

  const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/my-blogs", label: "My Blogs", icon: BookOpen },
  ];

  const createNavItems = [
    { href: "/new", label: "New Post", icon: PlusCircle },
  ];

  const socialNavItems = [
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden text-xl font-bold sm:inline-block text-primary">
              Blog-A
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-4">
              {auth.currentUser && (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    {createNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                            pathname === item.href
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                    {socialNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-2 transition-colors hover:text-primary ${
                            pathname === item.href
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline-block">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <UserNav />
                </>
              )}
              {!auth.currentUser && (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Sign In</span>
                  </Button>
                </Link>
              )}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 