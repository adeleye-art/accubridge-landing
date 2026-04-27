import type { Role, OrderStatus } from '@/types'

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyOtp: '/verify-otp',
  adminDashboard: '/admin/dashboard',
  adminVendors: '/admin/vendors',
  adminOrders: '/admin/orders',
  adminDrivers: '/admin/drivers',
  adminReferrals: '/admin/referrals',
  adminSettings: '/admin/settings',
  vendorDashboard: '/vendor/dashboard',
  driverDashboard: '/driver/dashboard',
  customerHome: '/customer/home',
} as const

export const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/admin/dashboard',
  vendor: '/vendor/dashboard',
  driver: '/driver/dashboard',
  customer: '/customer/home',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const COOKIE_NAME = 'afrocart_token'
export const STORAGE_KEY = 'afrocart_auth'

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Vendor Management', href: '/admin/vendors', icon: 'Store' },
  { label: 'Order Monitor', href: '/admin/orders', icon: 'ShoppingBag' },
  { label: 'Driver Management', href: '/admin/drivers', icon: 'Truck' },
  { label: 'Referrals & Credits', href: '/admin/referrals', icon: 'Gift' },
  { label: 'Commissions', href: '/admin/settings', icon: 'Percent' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const
