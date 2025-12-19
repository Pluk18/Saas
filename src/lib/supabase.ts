import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Customer = {
  id: string
  customer_code: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  line_id?: string
  address?: string
  id_card_number?: string
  customer_type: 'regular' | 'vip' | 'wholesale'
  total_purchases: number
  created_at: string
  updated_at: string
}

export type GoldPrice = {
  id: string
  price_date: string
  gold_bar_buy: number
  gold_bar_sell: number
  gold_jewelry_buy: number
  gold_jewelry_sell: number
  source: string
  created_at: string
}

export type Product = {
  id: string
  product_code: string
  category_id: string
  product_name: string
  product_type: string
  gold_percentage: number
  weight_baht: number
  weight_grams: number
  pattern_code?: string
  pattern_name?: string
  labor_cost: number
  gem_cost: number
  other_cost: number
  selling_price?: number
  cost_price?: number
  stock_quantity: number
  location?: string
  status: 'available' | 'sold' | 'consignment' | 'reserved'
  image_urls?: string[]
  created_at: string
  updated_at: string
}

export type ProductCategory = {
  id: string
  category_code: string
  category_name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export type Consignment = {
  id: string
  consignment_code: string
  customer_id: string
  product_description: string
  weight_baht: number
  weight_grams: number
  gold_percentage: number
  principal_amount: number
  interest_rate: number
  interest_type: 'monthly' | 'daily'
  start_date: string
  due_date: string
  total_months?: number
  status: 'active' | 'extended' | 'redeemed' | 'foreclosed'
  created_at: string
}

export type GoldSaving = {
  id: string
  account_code: string
  customer_id: string
  target_weight_baht?: number
  current_weight_baht: number
  total_deposited: number
  status: 'active' | 'withdrawn' | 'converted'
  start_date: string
  created_at: string
}

export type SalesTransaction = {
  id: string
  transaction_code: string
  customer_id?: string
  transaction_date: string
  subtotal: number
  vat_amount: number
  discount_amount: number
  trade_in_amount: number
  total_amount: number
  payment_method: 'cash' | 'transfer' | 'card' | 'mixed'
  payment_status: 'paid' | 'pending' | 'partial'
  tax_invoice_number?: string
  created_at: string
}

