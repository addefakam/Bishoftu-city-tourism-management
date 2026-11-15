'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Waves, Menu, X, ChevronDown, LogIn, UserPlus, Building2, Hotel as HotelIcon, Shield, User, LogOut, LayoutDashboard, Globe } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth, type UserRole } from '@/lib/auth'
import { AuthModal } from '@/components/auth/auth-modal'

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

const ROLE_LABELS: Record<UserRole, string> = {
  hotel_manager: 'Hotel Manager',
  tourism_admin: 'Tourism Office',
  police: 'Police',
  guest: 'Guest',
}

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  hotel_manager: HotelIcon,
  tourism_admin: Building2,
  police: Shield,
  guest: User,
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authOpen, setAuthOpen] = useState(false)
  const { user, logout, view, setView } = useAuth()

  function openLogin() { setAuthMode('login'); setAuthOpen(true) }
  function openRegister() { setAuthMode('register'); setAuthOpen(true) }

  const RoleIcon = user ? ROLE_ICONS[user.role] : User

  return (
    <>
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
              <Link key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {/* Dashboard toggle */}
                <Button
                  variant={view === 'dashboard' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                  onClick={() => setView(view === 'dashboard' ? 'public' : 'dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {view === 'dashboard' ? 'Back to Site' : 'My Dashboard'}
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex flex-col items-start leading-tight">
                        <span className="text-xs font-medium">{user.name}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <RoleIcon className="h-2.5 w-2.5" /> {ROLE_LABELS[user.role]}
                        </span>
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setView('dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView('public')}>
                      <Globe className="mr-2 h-4 w-4" /> Public Site
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-rose-600 focus:text-rose-700">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={openLogin}>
                  <LogIn className="h-4 w-4" /> Login
                </Button>
                <Button size="sm" className="gap-2" onClick={openRegister}>
                  <UserPlus className="h-4 w-4" /> Register
                </Button>
              </>
            )}

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
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

                {user && (
                  <div className="border-b p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <RoleIcon className="h-2.5 w-2.5" /> {ROLE_LABELS[user.role]}
                      </Badge>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1 p-4">
                  {navLinks.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary">
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="border-t p-4 space-y-2">
                  {user ? (
                    <>
                      <Button
                        variant={view === 'dashboard' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => { setView(view === 'dashboard' ? 'public' : 'dashboard'); setOpen(false) }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {view === 'dashboard' ? 'Back to Site' : 'My Dashboard'}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full gap-2 text-rose-600" onClick={() => { logout(); setOpen(false) }}>
                        <LogOut className="h-4 w-4" /> Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { openLogin(); setOpen(false) }}>
                        <LogIn className="h-4 w-4" /> Login
                      </Button>
                      <Button size="sm" className="w-full gap-2" onClick={() => { openRegister(); setOpen(false) }}>
                        <UserPlus className="h-4 w-4" /> Register
                      </Button>
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    {languages.map((l) => (
                      <Button key={l.code} variant="ghost" size="sm" className="flex-1">{l.code}</Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal mode={authMode} open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
