import type { Role, OrderStatus } from '@/types'

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  verifyOtp: '/afrocart/verify-otp',
  adminDashboard: '/afrocart/admin/dashboard',
  adminVendors: '/afrocart/admin/vendors',
  adminOrders: '/afrocart/admin/orders',
  adminDrivers: '/afrocart/admin/drivers',
  adminReferrals: '/afrocart/admin/referrals',
  adminSettings: '/afrocart/admin/settings',
  vendorDashboard: '/afrocart/vendor/dashboard',
  driverDashboard: '/afrocart/driver/dashboard',
  customerHome: '/afrocart/customer/home',
} as const

export const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/afrocart/admin/dashboard',
  vendor: '/afrocart/vendor/dashboard',
  driver: '/afrocart/driver/dashboard',
  customer: '/afrocart/customer/home',
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

export const COOKIE_NAME = 'swidex_token'
export const STORAGE_KEY = 'swidex_auth'

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', href: '/afrocart/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Vendor Management', href: '/afrocart/admin/vendors', icon: 'Store' },
  { label: 'Order Monitor', href: '/afrocart/admin/orders', icon: 'ShoppingBag' },
  { label: 'Driver Management', href: '/afrocart/admin/drivers', icon: 'Truck' },
  { label: 'Referrals & Credits', href: '/afrocart/admin/referrals', icon: 'Gift' },
  { label: 'Commissions', href: '/afrocart/admin/settings', icon: 'Percent' },
  { label: 'Settings', href: '/afrocart/admin/settings', icon: 'Settings' },
] as const
