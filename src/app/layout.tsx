import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { anekBangla } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blog App",
  description: "A modern blog application built with Next.js",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} ${anekBangla.variable}`}>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary",
        inter.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <ClientLayout>
              <main className="flex-1">
                {children}
              </main>
            </ClientLayout>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
