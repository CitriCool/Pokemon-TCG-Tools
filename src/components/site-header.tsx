"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/torneos", label: "Torneos", icon: "🏆" },
  { href: "/jugadores", label: "Jugadores", icon: "👤" },
  { href: "/barajas", label: "Barajas", icon: "🃏" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold text-lg mr-8">
          <span className="text-primary">⚡</span>
          <Link href="/" className="hidden sm:inline">
            Pokémon TCG Tools
          </Link>
          <Link href="/" className="sm:hidden">
            PTools
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center justify-center rounded-lg h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all ${active ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'hover:bg-muted'}`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
            ☰
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px]">
            <div className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center justify-start rounded-lg h-8 px-2.5 text-sm font-medium whitespace-nowrap transition-all ${active ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'hover:bg-muted'}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
