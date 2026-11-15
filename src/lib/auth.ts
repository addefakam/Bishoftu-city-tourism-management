// Auth store — Zustand with localStorage persistence.
// Manages the current user session and provides login/register/logout.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'hotel_manager' | 'tourism_admin' | 'police' | 'guest'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  hotelId?: string // for hotel managers — which hotel they manage
  createdAt: string
}

interface AuthState {
  user: User | null
  view: 'public' | 'dashboard'
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (data: { email: string; password: string; name: string; role: UserRole; hotelId?: string }) => { ok: boolean; error?: string }
  logout: () => void
  setView: (v: 'public' | 'dashboard') => void
}

// Seed users — one per role. In production these would live in a database.
const SEED_USERS: Array<User & { password: string }> = [
  {
    id: 'seed-hotel',
    email: 'hotel@bishoftu.gov.et',
    password: 'bishoftu2026',
    name: 'Kuriftu Resort Manager',
    role: 'hotel_manager',
    hotelId: 'cmvyatfhb0000q151msq5skw8', // Kuriftu Resort & Spa Bishoftu
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-admin',
    email: 'admin@bishoftu.gov.et',
    password: 'bishoftu2026',
    name: 'Tourism Office Admin',
    role: 'tourism_admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-police',
    email: 'police@bishoftu.gov.et',
    password: 'bishoftu2026',
    name: 'Bishoftu Tourist Police',
    role: 'police',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-guest',
    email: 'guest@example.com',
    password: 'bishoftu2026',
    name: 'Demo Guest',
    role: 'guest',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

// Registered users are stored in localStorage under this key.
const USERS_KEY = 'bishoftu_users'
const PASSWORDS_KEY = 'bishoftu_passwords' // email -> password (demo only, never do this in production)

function loadUsers(): User[] {
  if (typeof window === 'undefined') return SEED_USERS.map(({ password, ...u }) => u)
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (!stored) {
      // First load — seed the localStorage with seed users
      const seedUsers = SEED_USERS.map(({ password, ...u }) => u)
      localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
      const pwdMap: Record<string, string> = {}
      SEED_USERS.forEach((u) => { pwdMap[u.email] = u.password })
      localStorage.setItem(PASSWORDS_KEY, JSON.stringify(pwdMap))
      return seedUsers
    }
    return JSON.parse(stored)
  } catch {
    return SEED_USERS.map(({ password, ...u }) => u)
  }
}

function saveUser(user: User, password: string) {
  if (typeof window === 'undefined') return
  const users = loadUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const pwdMap: Record<string, string> = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}')
  pwdMap[user.email] = password
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(pwdMap))
}

function getPassword(email: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const pwdMap: Record<string, string> = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}')
    return pwdMap[email] ?? null
  } catch {
    return null
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      view: 'public',
      login: (email, password) => {
        const users = loadUsers()
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (!found) return { ok: false, error: 'No account found with that email.' }
        const expected = getPassword(found.email)
        if (expected !== password) return { ok: false, error: 'Incorrect password.' }
        set({ user: found, view: 'dashboard' })
        return { ok: true }
      },
      register: ({ email, password, name, role, hotelId }) => {
        const users = loadUsers()
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { ok: false, error: 'An account with that email already exists.' }
        }
        const user: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          role,
          hotelId: role === 'hotel_manager' ? hotelId : undefined,
          createdAt: new Date().toISOString(),
        }
        saveUser(user, password)
        set({ user, view: 'dashboard' })
        return { ok: true }
      },
      logout: () => set({ user: null, view: 'public' }),
      setView: (v) => set({ view: v }),
    }),
    { name: 'bishoftu_auth' }
  )
)

// Helper to get all registered users (for admin dashboard)
export function getAllUsers(): User[] {
  return loadUsers()
}

// Demo credentials shown on the login modal
export const DEMO_CREDENTIALS = SEED_USERS.map(({ password, ...u }) => ({
  email: u.email,
  password,
  role: u.role,
  name: u.name,
}))
