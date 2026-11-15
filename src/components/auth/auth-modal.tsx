'use client'

import { useState, useEffect } from 'react'
import { LogIn, UserPlus, X, Hotel as HotelIcon, Building2, Shield, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth, DEMO_CREDENTIALS, type UserRole } from '@/lib/auth'
import { store } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; icon: React.ElementType; desc: string }> = [
  { value: 'guest', label: 'Guest', icon: User, desc: 'Browse hotels, save favorites' },
  { value: 'hotel_manager', label: 'Hotel Manager', icon: HotelIcon, desc: 'Manage your hotel & occupancy' },
  { value: 'tourism_admin', label: 'Tourism Office', icon: Building2, desc: 'Full platform oversight' },
  { value: 'police', label: 'Police', icon: Shield, desc: 'Guest registry & security' },
]

export function AuthModal({ mode, open, onOpenChange }: {
  mode: 'login' | 'register'
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('guest')
  const [hotelId, setHotelId] = useState('')

  const hotels = store.hotels.findMany()

  function fillDemo(em: string, pwd: string) {
    setEmail(em)
    setPassword(pwd)
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setName('')
    setRole('guest')
    setHotelId('')
    setShowPassword(false)
  }

  useEffect(() => {
    if (!open) {
      setTimeout(resetForm, 200)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (mode === 'login') {
        const result = login(email, password)
        if (!result.ok) {
          toast({ title: 'Login failed', description: result.error, variant: 'destructive' })
        } else {
          toast({ title: 'Welcome back!', description: 'You are now logged in.' })
          onOpenChange(false)
        }
      } else {
        if (role === 'hotel_manager' && !hotelId) {
          toast({ title: 'Hotel required', description: 'Please select the hotel you manage.', variant: 'destructive' })
          setLoading(false)
          return
        }
        const result = register({ email, password, name, role, hotelId })
        if (!result.ok) {
          toast({ title: 'Registration failed', description: result.error, variant: 'destructive' })
        } else {
          toast({ title: 'Account created!', description: 'Welcome to Bishoftu Tourism.' })
          onOpenChange(false)
        }
      }
      setLoading(false)
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'login' ? <LogIn className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {mode === 'login' ? 'Login to your account' : 'Create a new account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Access your hotel, tourism, police, or guest portal.'
              : 'Register as a guest, hotel manager, tourism office, or police officer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Abebe Bekele" />
              </div>

              <div className="space-y-2">
                <Label>Account type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
                        role === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <opt.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {role === 'hotel_manager' && (
                <div className="space-y-2">
                  <Label htmlFor="reg-hotel">Hotel you manage</Label>
                  <Select value={hotelId} onValueChange={setHotelId}>
                    <SelectTrigger id="reg-hotel"><SelectValue placeholder="Select your hotel" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {hotels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>

        {mode === 'login' && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Demo accounts (click to fill)</p>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map((c) => {
                const opt = ROLE_OPTIONS.find((o) => o.value === c.role)
                const Icon = opt?.icon ?? User
                return (
                  <button
                    key={c.email}
                    onClick={() => fillDemo(c.email, c.password)}
                    className="flex w-full items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-left text-xs hover:bg-primary/5 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium truncate">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">{opt?.label ?? c.role}</Badge>
                    </span>
                    <span className="text-muted-foreground shrink-0 font-mono text-[11px]">{c.email}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Password for all demo accounts: <code className="font-mono">bishoftu2026</code></p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
