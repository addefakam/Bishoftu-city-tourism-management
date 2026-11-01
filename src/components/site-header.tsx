'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Waves, Menu, X, ChevronDown, LogIn, UserPlus, Building2, Hotel as HotelIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#hotels', label: 'Hotels' },
  { href: '#virtual', label: 'Virtual Bishoftu' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact Us' },
]

const languages = [
  { code: 'EN', label: 'English' },
  { code: 'OM', label: 'Afaan Oromoo' },
  { code: 'AM', label: 'አማርኛ (Amharic)' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Waves className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">Bishoftu Tourism</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Lake City · Oromia</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Login dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" /> Login
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Choose portal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HotelIcon className="mr-2 h-4 w-4" /> Hotel Login
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Tourism Office Login
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Police Login
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" /> Guest Login
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Registration dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" /> Registration
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <HotelIcon className="mr-2 h-4 w-4" /> Register Hotel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="mr-2 h-4 w-4" /> Register Business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                EN <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} className="justify-between">
                  <span className="font-medium">{l.code}</span>
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile trigger */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center justify-between border-b px-4">
                <span className="flex items-center gap-2 font-semibold">
                  <Waves className="h-5 w-5 text-primary" /> Menu
                </span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="border-t p-4 space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Login</p>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <HotelIcon className="h-4 w-4" /> Hotel Login
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" /> Tourism Office Login
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <UserPlus className="h-4 w-4" /> Guest Login
                </Button>
                <p className="pt-3 text-xs uppercase tracking-wider text-muted-foreground">Register</p>
                <Button size="sm" className="w-full justify-start gap-2">
                  <HotelIcon className="h-4 w-4" /> Register Hotel
                </Button>
                <Button size="sm" variant="secondary" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4" /> Register Business
                </Button>
                <p className="pt-3 text-xs uppercase tracking-wider text-muted-foreground">Language</p>
                <div className="flex gap-2">
                  {languages.map((l) => (
                    <Button key={l.code} variant="ghost" size="sm" className="flex-1">
                      {l.code}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
