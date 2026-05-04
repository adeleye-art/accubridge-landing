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

export type BusinessType = 'restaurant' | 'store'

export interface VendorStats {
  orders_today: number
  revenue_today: number
  avg_prep_time: number
  rating: number
  orders_this_week: number
  revenue_this_week: number
  daily_earnings: { date: string; amount: number }[]
}

export interface VendorOrder {
  id: string
  order_number: string
  customer_name: string
  customer_address: string
  customer_note?: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total_amount: number
  payment_status: 'paid' | 'pending' | 'refunded'
  status: OrderStatus
  placed_at: string
  accepted_at?: string
  ready_at?: string
  picked_at?: string
  delivered_at?: string
  prep_time_minutes?: number
  driver_name?: string
  driver_phone?: string
}

export interface MenuItem {
  id: string
  vendor_id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  availability: boolean
  created_at: string
  updated_at: string
}

export interface MenuCategory {
  id: string
  name: string
  item_count: number
}

export interface EarningsRecord {
  id: string
  order_id: string
  order_number: string
  date: string
  items_total: number
  commission_rate: number
  commission_amount: number
  net_earned: number
  payout_status: 'pending' | 'paid' | 'processing'
}

export interface PayoutInfo {
  next_payout_date: string
  pending_amount: number
  bank_account_masked: string
  bank_name: string
}

export interface VendorProfile {
  id: string
  user_id: string
  business_name: string
  business_type: BusinessType
  address: string
  phone: string
  email: string
  logo_url?: string
  banner_url?: string
  description?: string
  is_open: boolean
  commission_rate: number
  approval_status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  rating: number
  total_orders: number
  created_at: string
}

export interface CreateMenuItemRequest {
  name: string
  description: string
  price: number
  category: string
  availability: boolean
  image?: File
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  id: string
}

export interface VendorStoreSettingsRequest {
  business_name: string
  description: string
  phone: string
  address: string
  is_open: boolean
  logo?: File
  banner?: File
}

// ─── Customer types ───────────────────────────────────────────────────────────

export interface Restaurant {
  id: string
  business_name: string
  business_type: 'restaurant'
  address: string
  logo_url?: string
  banner_url?: string
  description?: string
  rating: number
  total_reviews: number
  delivery_time_min: number
  delivery_time_max: number
  delivery_fee: number
  min_order: number
  is_open: boolean
  cuisine_tags: string[]
  distance_miles?: number
}

export interface GroceryStore {
  id: string
  business_name: string
  business_type: 'store'
  address: string
  logo_url?: string
  banner_url?: string
  description?: string
  rating: number
  delivery_time_min: number
  delivery_time_max: number
  delivery_fee: number
  min_order: number
  is_open: boolean
  category_tags: string[]
  distance_miles?: number
}

export interface CartItem {
  id: string
  menu_item_id: string
  vendor_id: string
  vendor_name: string
  name: string
  description: string
  price: number
  quantity: number
  image_url?: string
  category: string
}

export interface Cart {
  items: CartItem[]
  vendor_id: string | null
  vendor_name: string | null
}

export interface CartCalculation {
  subtotal: number
  delivery_fee: number
  credits_applicable: number
  credits_applied: number
  discount: number
  total: number
}

export interface Address {
  id: string
  label: string
  full_address: string
  postcode: string
  is_default: boolean
}

export interface PromoCode {
  code: string
  discount_type: 'fixed' | 'percent'
  discount_value: number
  min_order?: number
  valid: boolean
  message: string
}

export interface CustomerOrder {
  id: string
  order_number: string
  vendor_id: string
  vendor_name: string
  vendor_logo_url?: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  credits_used: number
  discount: number
  total_amount: number
  delivery_address: string
  status: OrderStatus
  driver_name?: string
  driver_phone?: string
  driver_rating?: number
  estimated_delivery_time?: string
  placed_at: string
  delivered_at?: string
  timeline: OrderTimelineEvent[]
}

export interface OrderTimelineEvent {
  status: OrderStatus
  timestamp: string
  note?: string
}

export type DeliveryItemType =
  | 'document'
  | 'parcel_small'
  | 'parcel_large'
  | 'food'
  | 'groceries'
  | 'other'

// ─── Driver types ─────────────────────────────────────────────────────────────

export interface AvailableJob {
  id: string
  order_number: string
  type: 'food' | 'grocery' | 'delivery'
  pickup_name: string
  pickup_address: string
  dropoff_address: string
  distance_miles: number
  estimated_minutes: number
  earnings: number
  item_type?: DeliveryItemType
  item_summary?: string
  vendor_name?: string
  customer_first_name: string
  posted_at: string
}

export interface ActiveDelivery {
  id: string
  order_number: string
  type: 'food' | 'grocery' | 'delivery'
  pickup_name: string
  pickup_address: string
  pickup_phone: string
  dropoff_address: string
  dropoff_phone: string
  customer_first_name: string
  item_summary: string
  customer_note?: string
  earnings: number
  accepted_at: string
  status: 'accepted' | 'en_route_pickup' | 'picked_up' | 'en_route_dropoff'
  distance_miles: number
  estimated_minutes: number
}

export interface CompletedDelivery {
  id: string
  order_number: string
  type: 'food' | 'grocery' | 'delivery'
  pickup_name: string
  pickup_address: string
  dropoff_address: string
  customer_first_name: string
  item_summary: string
  customer_note?: string
  distance_miles: number
  earnings: number
  tip?: number
  total_earned?: number
  accepted_at: string
  completed_at: string
  duration_minutes: number
  payout_status: 'pending' | 'processing' | 'paid'
  rating?: number
}

export interface DriverEarningsSummary {
  today: number
  this_week: number
  this_month: number
  all_time: number
  deliveries_today: number
  deliveries_week: number
  daily_earnings: {
    date: string
    amount: number
    deliveries: number
  }[]
}

export interface DriverPayoutInfo {
  pending_amount: number
  next_payout_date: string
  bank_account_masked: string
  bank_name: string
}

export interface DriverProfileUpdate {
  name: string
  phone: string
  vehicle_plate: string
}

export interface DeliveryRequest {
  id: string
  pickup_location: string
  dropoff_location: string
  item_type: DeliveryItemType
  item_description?: string
  price: number
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
  driver_name?: string
  created_at: string
}

export interface DeliveryQuote {
  estimated_price: number
  estimated_time: number
  vehicle_type: string
}

export interface WalletTransaction {
  id: string
  amount: number
  type: 'earned' | 'deducted' | 'refunded'
  reason: string
  created_at: string
}

export interface ReferralStatus {
  my_code: string
  total_referred: number
  total_earned: number
  referrals: {
    name: string
    orders_completed: number
    reward_status: 'pending' | 'paid'
    joined_at: string
  }[]
}

export interface ReviewRequest {
  order_id: string
  vendor_id: string
  rating: number
  comment?: string
}

// ─── Auth types ───────────────────────────────────────────────────────────────

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
