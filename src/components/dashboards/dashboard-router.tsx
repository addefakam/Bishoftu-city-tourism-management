'use client'

import { useAuth } from '@/lib/auth'
import { HotelManagerDashboard } from './hotel-manager-dashboard'
import { TourismAdminDashboard } from './tourism-admin-dashboard'
import { PoliceDashboard } from './police-dashboard'
import { GuestDashboard } from './guest-dashboard'

export function DashboardRouter() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case 'hotel_manager':
      return <HotelManagerDashboard />
    case 'tourism_admin':
      return <TourismAdminDashboard />
    case 'police':
      return <PoliceDashboard />
    case 'guest':
      return <GuestDashboard />
    default:
      return null
  }
}
