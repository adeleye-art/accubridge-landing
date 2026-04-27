export type Role = 'customer' | 'vendor' | 'driver' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  referral_code: string
  referred_by?: string
  credit_balance: number
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Vendor {
  id: string
  user_id: string
  business_name: string
  business_type: 'restaurant' | 'store'
  address: string
  status: 'pending' | 'approved' | 'rejected'
  commission_rate: number
  created_at: string
  owner_name: string
  email: string
  phone: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  customer_name: string
  vendor_id: string
  vendor_name: string
  items: OrderItem[]
  total_amount: number
  delivery_fee: number
  credits_used: number
  status: OrderStatus
  driver_id?: string
  driver_name?: string
  created_at: string
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'picked_up'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  name: string
  quantity: number
  unit_price: number
  total: number
}

export type DriverApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type VehicleType = 'bicycle' | 'moped' | 'motorcycle' | 'car' | 'van'

export interface DriverDocument {
  type: 'driving_licence' | 'vehicle_insurance' | 'right_to_work' | 'profile_photo'
  file_url: string
  uploaded_at: string
  verified: boolean
}

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  status: 'online' | 'offline'
  approval_status: DriverApprovalStatus
  rejection_reason?: string
  vehicle_type: VehicleType
  vehicle_plate?: string
  documents: DriverDocument[]
  dbs_check_acknowledged: boolean
  active_deliveries: number
  total_completed: number
  rating: number
  earnings_today: number
  created_at: string
}

export interface DriverRegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  role: 'driver'
  vehicle_type: VehicleType
  vehicle_plate: string
  licence_number: string
  dbs_check_acknowledged: boolean
}

export interface DriverDocumentUploadResponse {
  document_type: string
  file_url: string
  message: string
}

export interface AdminStats {
  total_users: number
  orders_today: number
  revenue_today: number
  active_vendors: number
  pending_vendors: number
  active_drivers: number
  pending_drivers: number
  daily_orders: { date: string; count: number }[]
  revenue_split: { vendor: number; platform: number }
}

export interface Referral {
  id: string
  referrer_name: string
  referred_name: string
  orders_completed: number
  reward_status: 'pending' | 'paid'
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  user_name: string
  amount: number
  type: 'earned' | 'deducted'
  reason: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
  role: Role
}

export interface AuthResponse {
  user: User
  token: string
  message: string
  approval_status?: DriverApprovalStatus
}

export interface ApiError {
  status: number
  message: string
}
