import { supabase } from './supabase'
import type { Product, ProductCategory, GoldPrice, Customer } from './supabase'

// ============================================
// GOLD PRICES API
// ============================================

export async function getCurrentGoldPrice() {
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .order('price_date', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function getGoldPriceHistory(days: number = 7) {
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .order('price_date', { ascending: false })
    .limit(days)

  if (error) throw error
  return data
}

export async function updateGoldPrice(priceData: {
  price_date: string
  gold_bar_buy: number
  gold_bar_sell: number
  gold_jewelry_buy: number
  gold_jewelry_sell: number
  source?: string
}) {
  const { data, error } = await supabase
    .from('gold_prices')
    .upsert({
      ...priceData,
      source: priceData.source || 'manual'
    }, {
      onConflict: 'price_date'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// PRODUCTS API
// ============================================

export async function getProducts(filters?: {
  category?: string
  status?: string
  search?: string
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category_name,
        category_code
      )
    `)
    .is('deleted_at', null)

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('product_type', filters.category)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`product_code.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%,pattern_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category_name,
        category_code
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(product: {
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
  gem_cost?: number
  other_cost?: number
  selling_price?: number
  cost_price?: number
  stock_quantity: number
  location?: string
  supplier?: string
  status?: string
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  // Soft delete
  const { data, error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// PRODUCT CATEGORIES API
// ============================================

export async function getProductCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

// ============================================
// CUSTOMERS API
// ============================================

export async function getCustomers(filters?: {
  type?: string
  search?: string
}) {
  let query = supabase
    .from('customers')
    .select('*')
    .is('deleted_at', null)

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('customer_type', filters.type)
  }

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCustomer(customer: {
  customer_code: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  line_id?: string
  address?: string
  id_card_number?: string
  customer_type?: string
}) {
  // Clean the customer data - remove undefined, null, or empty strings for optional UNIQUE fields
  const cleanedCustomer = {
    ...customer,
    phone: customer.phone || undefined,
    email: customer.email || undefined,
    line_id: customer.line_id || undefined,
    address: customer.address || undefined,
    id_card_number: customer.id_card_number || undefined, // Important: UNIQUE constraint
    customer_type: customer.customer_type || 'regular',
  }

  // Remove undefined values
  Object.keys(cleanedCustomer).forEach(key => {
    if (cleanedCustomer[key as keyof typeof cleanedCustomer] === undefined) {
      delete cleanedCustomer[key as keyof typeof cleanedCustomer]
    }
  })

  console.log('Cleaned customer data before insert:', cleanedCustomer)

  const { data, error } = await supabase
    .from('customers')
    .insert(cleanedCustomer)
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    throw new Error(error.message || 'Database error')
  }
  
  return data
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCustomer(id: string) {
  // Soft delete
  const { data, error } = await supabase
    .from('customers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// INVENTORY STATS
// ============================================

export async function getInventoryStats() {
  const { data, error } = await supabase
    .from('inventory_summary')
    .select('*')

  if (error) throw error

  // Calculate totals
  const totals = data?.reduce((acc, item) => ({
    totalProducts: acc.totalProducts + (item.product_count || 0),
    totalWeight: acc.totalWeight + (item.total_weight_baht || 0),
    totalValue: acc.totalValue + (item.total_selling_value || 0),
  }), { totalProducts: 0, totalWeight: 0, totalValue: 0 })

  return { data, totals }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  // Get today's sales
  const today = new Date().toISOString().split('T')[0]
  
  const { data: salesData } = await supabase
    .from('sales_transactions')
    .select('total_amount, subtotal')
    .gte('transaction_date', today)
    .eq('payment_status', 'paid')

  const todaySales = salesData?.reduce((sum, t) => sum + t.total_amount, 0) || 0
  const transactionCount = salesData?.length || 0

  // Get inventory stats
  const { totals } = await getInventoryStats()

  return {
    todaySales,
    transactionCount,
    inventoryValue: totals?.totalValue || 0,
    inventoryCount: totals?.totalProducts || 0,
  }
}

// ============================================
// SALES / POS API
// ============================================

export async function getAvailableProducts(filters?: {
  search?: string
  category?: string
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category_name,
        category_code
      )
    `)
    .eq('status', 'available')
    .is('deleted_at', null)
    .gt('stock_quantity', 0)

  if (filters?.search) {
    query = query.or(`product_code.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%,pattern_name.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`)
  }

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('product_type', filters.category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createSalesTransaction(transaction: {
  customer_id?: string
  transaction_date: string
  subtotal: number
  vat_amount: number
  discount_amount: number
  trade_in_amount: number
  total_amount: number
  payment_method: 'cash' | 'transfer' | 'card' | 'mixed'
  payment_status: 'paid' | 'pending' | 'partial'
  cash_amount?: number
  transfer_amount?: number
  card_amount?: number
  include_vat?: boolean
  notes?: string
}) {
  // Generate transaction code
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  const transaction_code = `INV-${dateStr}-${randomStr}`

  const { data, error } = await supabase
    .from('sales_transactions')
    .insert({
      ...transaction,
      transaction_code,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createSalesItems(items: Array<{
  sales_transaction_id: string
  product_id: string
  product_code: string
  product_name: string
  weight_baht: number
  gold_price_per_baht: number
  labor_cost: number
  gem_cost: number
  other_cost: number
  unit_price: number
  quantity: number
  line_total: number
}>) {
  const { data, error } = await supabase
    .from('sales_items')
    .insert(items)
    .select()

  if (error) throw error
  return data
}

export async function createTradeInItem(tradeIn: {
  sales_transaction_id: string
  description: string
  weight_baht: number
  weight_grams: number
  gold_percentage: number
  gold_buy_price_per_baht: number
  trade_in_value: number
}) {
  const { data, error } = await supabase
    .from('trade_in_items')
    .insert(tradeIn)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductStock(productId: string, quantityChange: number) {
  // Get current stock
  const { data: product } = await supabase
    .from('products')
    .select('stock_quantity')
    .eq('id', productId)
    .single()

  if (!product) throw new Error('Product not found')

  const newStock = product.stock_quantity + quantityChange

  const { data, error } = await supabase
    .from('products')
    .update({ 
      stock_quantity: newStock,
      status: newStock <= 0 ? 'sold' : 'available'
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// CONSIGNMENTS API
// ============================================

export async function getConsignments(filters?: {
  status?: string
  customer_id?: string
  search?: string
}) {
  let query = supabase
    .from('consignments')
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if (filters?.search) {
    query = query.or(`consignment_code.ilike.%${filters.search}%,product_description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getConsignment(id: string) {
  const { data, error } = await supabase
    .from('consignments')
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone, address),
      payments:consignment_payments(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createConsignment(consignmentData: {
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
  image_urls?: string[]
  notes?: string
}) {
  // Generate consignment code
  const { data: lastConsignment } = await supabase
    .from('consignments')
    .select('consignment_code')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let newCode = 'CON-0001'
  if (lastConsignment) {
    const lastNumber = parseInt(lastConsignment.consignment_code.split('-')[1])
    newCode = `CON-${String(lastNumber + 1).padStart(4, '0')}`
  }

  const { data, error } = await supabase
    .from('consignments')
    .insert({
      ...consignmentData,
      consignment_code: newCode,
      status: 'active'
    })
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateConsignment(id: string, updates: Partial<{
  product_description: string
  weight_baht: number
  weight_grams: number
  gold_percentage: number
  principal_amount: number
  interest_rate: number
  interest_type: 'monthly' | 'daily'
  due_date: string
  total_months: number
  status: 'active' | 'extended' | 'redeemed' | 'foreclosed'
  image_urls: string[]
  notes: string
}>) {
  const { data, error } = await supabase
    .from('consignments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteConsignment(id: string) {
  const { error } = await supabase
    .from('consignments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Calculate interest
export async function calculateConsignmentInterest(
  consignmentId: string,
  asOfDate?: string
) {
  const consignment = await getConsignment(consignmentId)
  
  const startDate = new Date(consignment.start_date)
  const endDate = asOfDate ? new Date(asOfDate) : new Date()
  const dueDate = new Date(consignment.due_date)
  
  // คำนวณจำนวนวันที่ผ่านไป
  const daysPassed = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  let interest = 0
  
  if (consignment.interest_type === 'monthly') {
    // คำนวณแบบรายเดือน
    const monthsPassed = daysPassed / 30
    interest = consignment.principal_amount * (consignment.interest_rate / 100) * monthsPassed
  } else {
    // คำนวณแบบรายวัน
    interest = consignment.principal_amount * (consignment.interest_rate / 100) * daysPassed
  }
  
  // คำนวณดอกเบี้ยที่ชำระแล้ว
  const { data: payments } = await supabase
    .from('consignment_payments')
    .select('amount')
    .eq('consignment_id', consignmentId)
    .eq('payment_type', 'interest')
  
  const paidInterest = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const remainingInterest = Math.max(0, interest - paidInterest)
  
  // เช็คว่าเกินกำหนดหรือไม่
  const isOverdue = endDate > dueDate
  const daysOverdue = isOverdue ? Math.floor((endDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
  
  return {
    totalInterest: interest,
    paidInterest,
    remainingInterest,
    principal: consignment.principal_amount,
    totalAmount: consignment.principal_amount + remainingInterest,
    daysPassed,
    isOverdue,
    daysOverdue,
    dueDate: consignment.due_date
  }
}

// Create payment for consignment
export async function createConsignmentPayment(paymentData: {
  consignment_id: string
  payment_date: string
  principal_payment: number
  interest_payment: number
  total_payment: number
  payment_method: 'cash' | 'transfer' | 'card'
  reference_number?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('consignment_payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get overdue consignments
export async function getOverdueConsignments() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('consignments')
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone)
    `)
    .eq('status', 'active')
    .lt('due_date', today)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

// ==================== Gold Savings ====================

// Get all gold savings accounts
export async function getGoldSavings(filters?: {
  customer_id?: string
  status?: 'active' | 'completed' | 'withdrawn'
  search?: string
}) {
  let query = supabase
    .from('gold_savings')
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone)
    `)

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    query = query.or(`account_code.ilike.%${filters.search}%,customer.first_name.ilike.%${filters.search}%,customer.last_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get single gold saving account
export async function getGoldSaving(id: string) {
  const { data, error } = await supabase
    .from('gold_savings')
    .select(`
      *,
      customer:customers(id, customer_code, first_name, last_name, phone, email),
      transactions:gold_saving_transactions(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Create gold saving account
export async function createGoldSaving(savingData: {
  customer_id: string
  account_code: string
  target_weight_baht?: number
  target_amount?: number
  notes?: string
}) {
  const { data, error } = await supabase
    .from('gold_savings')
    .insert({
      ...savingData,
      status: 'active',
      total_amount: 0,
      total_weight_baht: 0,
      total_weight_grams: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update gold saving account
export async function updateGoldSaving(id: string, updates: any) {
  const { data, error } = await supabase
    .from('gold_savings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete gold saving account
export async function deleteGoldSaving(id: string) {
  const { data, error } = await supabase
    .from('gold_savings')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Create deposit transaction
export async function createGoldSavingDeposit(transactionData: {
  gold_saving_id: string
  transaction_date: string
  amount: number
  payment_method: 'cash' | 'transfer' | 'card'
  reference_number?: string
  notes?: string
}) {
  // Get current balance
  const { data: saving } = await supabase
    .from('gold_savings')
    .select('balance')
    .eq('id', transactionData.gold_saving_id)
    .single()

  if (!saving) throw new Error('Gold saving account not found')

  const newBalance = (saving.balance || 0) + transactionData.amount

  // Create deposit transaction with balance_after
  const { data: transaction, error: transError } = await supabase
    .from('gold_saving_transactions')
    .insert({
      gold_saving_id: transactionData.gold_saving_id,
      transaction_date: transactionData.transaction_date,
      transaction_type: 'deposit',
      amount: transactionData.amount,
      payment_method: transactionData.payment_method,
      reference_number: transactionData.reference_number,
      notes: transactionData.notes,
      balance_after: newBalance,
    })
    .select()
    .single()

  if (transError) throw transError

  // Update gold saving account balance
  await supabase
    .from('gold_savings')
    .update({
      balance: newBalance,
      total_amount: newBalance, // Keep total_amount in sync for now
    })
    .eq('id', transactionData.gold_saving_id)

  return transaction
}

// Create withdrawal transaction
export async function createGoldSavingWithdrawal(transactionData: {
  gold_saving_id: string
  transaction_date: string
  amount: number
  withdrawal_type: 'gold' | 'cash'
  product_description?: string
  notes?: string
}) {
  // Get current balance
  const { data: saving } = await supabase
    .from('gold_savings')
    .select('balance')
    .eq('id', transactionData.gold_saving_id)
    .single()

  if (!saving) throw new Error('Gold saving account not found')

  const newBalance = Math.max(0, (saving.balance || 0) - transactionData.amount)

  // Create withdrawal transaction with balance_after
  const { data: transaction, error: transError } = await supabase
    .from('gold_saving_transactions')
    .insert({
      gold_saving_id: transactionData.gold_saving_id,
      transaction_date: transactionData.transaction_date,
      transaction_type: 'withdrawal',
      amount: transactionData.amount,
      withdrawal_type: transactionData.withdrawal_type,
      product_description: transactionData.product_description,
      notes: transactionData.notes,
      balance_after: newBalance,
    })
    .select()
    .single()

  if (transError) throw transError

  // Update gold saving account balance
  await supabase
    .from('gold_savings')
    .update({
      balance: newBalance,
      total_amount: newBalance, // Keep total_amount in sync for now
      status: newBalance <= 0 ? 'withdrawn' : 'active',
    })
    .eq('id', transactionData.gold_saving_id)

  return transaction
}

// Get transactions for a gold saving account
export async function getGoldSavingTransactions(gold_saving_id: string) {
  const { data, error } = await supabase
    .from('gold_saving_transactions')
    .select('*')
    .eq('gold_saving_id', gold_saving_id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Fetch current gold price (wrapper for gold savings)
export async function fetchCurrentGoldPrice() {
  try {
    // Try to get from gold_prices table first
    const { data, error } = await supabase
      .from('gold_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      return {
        bar_buy: data.gold_bar_buy,
        bar_sell: data.gold_bar_sell,
        ornament_buy: data.gold_jewelry_buy,
        ornament_sell: data.gold_jewelry_sell,
        date: data.price_date,
      }
    }
  } catch (err) {
    console.error('Error fetching from database:', err)
  }

  // Fallback: fetch from API
  try {
    const response = await fetch('/api/gold-price', {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch gold price from API')
    }

    const result = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Invalid API response')
    }

    return {
      bar_buy: result.data.goldBarBuy,
      bar_sell: result.data.goldBarSell,
      ornament_buy: result.data.goldJewelryBuy,
      ornament_sell: result.data.goldJewelrySell,
      date: result.data.date,
    }
  } catch (error) {
    console.error('Error fetching gold price:', error)
    
    // Last resort: return mock data
    return {
      bar_buy: 40000,
      bar_sell: 40100,
      ornament_buy: 39000,
      ornament_sell: 41000,
      date: new Date().toISOString().split('T')[0],
    }
  }
}

// Calculate gold saving summary
export async function calculateGoldSavingSummary(gold_saving_id: string) {
  const saving = await getGoldSaving(gold_saving_id)

  if (!saving) {
    throw new Error('Could not calculate summary')
  }

  // Current value is simply the balance
  const currentValue = saving.balance || 0

  // Calculate if target is reached
  const targetReached = saving.target_amount
    ? currentValue >= saving.target_amount
    : false

  // Calculate progress percentage
  const progressPercentage = saving.target_amount
    ? (currentValue / saving.target_amount) * 100
    : 0

  return {
    currentBalance: currentValue,
    totalDeposited: saving.total_amount, // เงินที่ฝากทั้งหมด (รวมที่ถอนแล้ว)
    currentValue,
    targetAmount: saving.target_amount || 0,
    targetReached,
    progressPercentage: Math.min(progressPercentage, 100),
    transactionCount: saving.transactions?.length || 0,
  }
}

// ============================================
// REPORTS API
// ============================================

// Sales Reports
export async function getSalesReport(startDate: string, endDate: string, filters?: {
  paymentMethod?: string
  customerId?: string
}) {
  let query = supabase
    .from('sales_transactions')
    .select(`
      *,
      customers (
        customer_name,
        phone_number
      ),
      sales_items (
        *,
        products (
          product_name,
          product_code
        )
      )
    `)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)
    .order('sale_date', { ascending: false })

  if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
    query = query.eq('payment_method', filters.paymentMethod)
  }

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getSalesSummary(startDate: string, endDate: string) {
  const { data: sales, error } = await supabase
    .from('sales_transactions')
    .select('*')
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)

  if (error) throw error

  const totalSales = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0
  const totalDiscount = sales?.reduce((sum, sale) => sum + (sale.discount_amount || 0), 0) || 0
  const totalTradeIn = sales?.reduce((sum, sale) => sum + (sale.trade_in_amount || 0), 0) || 0
  const totalVat = sales?.reduce((sum, sale) => sum + (sale.vat_amount || 0), 0) || 0
  const netAmount = totalSales - totalDiscount - totalTradeIn + totalVat
  const transactionCount = sales?.length || 0
  const averagePerTransaction = transactionCount > 0 ? netAmount / transactionCount : 0

  return {
    totalSales,
    totalDiscount,
    totalTradeIn,
    totalVat,
    netAmount,
    transactionCount,
    averagePerTransaction
  }
}

export async function getDailySalesReport(startDate: string, endDate: string) {
  const { data: sales, error } = await supabase
    .from('sales_transactions')
    .select('*')
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)
    .order('sale_date', { ascending: true })

  if (error) throw error

  // Group by date
  const dailyData: Record<string, any> = {}

  sales?.forEach((sale) => {
    const date = sale.sale_date.split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        count: 0,
        totalSales: 0,
        discount: 0,
        tradeIn: 0,
        vat: 0,
        net: 0
      }
    }

    dailyData[date].count++
    dailyData[date].totalSales += sale.total_amount || 0
    dailyData[date].discount += sale.discount_amount || 0
    dailyData[date].tradeIn += sale.trade_in_amount || 0
    dailyData[date].vat += sale.vat_amount || 0
    dailyData[date].net = dailyData[date].totalSales - dailyData[date].discount - dailyData[date].tradeIn + dailyData[date].vat
  })

  return Object.values(dailyData)
}

export async function getTopSellingProducts(startDate: string, endDate: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('sales_items')
    .select(`
      *,
      products (
        product_id,
        product_name,
        product_code
      ),
      sales_transactions!inner (
        sale_date
      )
    `)
    .gte('sales_transactions.sale_date', startDate)
    .lte('sales_transactions.sale_date', endDate)

  if (error) throw error

  // Group by product
  const productData: Record<string, any> = {}

  data?.forEach((item: any) => {
    const productId = item.product_id
    if (!productData[productId]) {
      productData[productId] = {
        productId,
        productName: item.products?.product_name || 'Unknown',
        productCode: item.products?.product_code || '',
        quantity: 0,
        totalValue: 0
      }
    }

    productData[productId].quantity++
    productData[productId].totalValue += item.sale_price || 0
  })

  return Object.values(productData)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, limit)
}

export async function getPaymentMethodBreakdown(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('sales_transactions')
    .select('payment_method, total_amount')
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)

  if (error) throw error

  const breakdown: Record<string, any> = {}

  data?.forEach((sale) => {
    const method = sale.payment_method || 'unknown'
    if (!breakdown[method]) {
      breakdown[method] = {
        method,
        count: 0,
        totalAmount: 0
      }
    }

    breakdown[method].count++
    breakdown[method].totalAmount += sale.total_amount || 0
  })

  return Object.values(breakdown)
}

// Inventory Reports
export async function getInventoryReport() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category_name
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getInventorySummary() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)

  if (error) throw error

  const totalProducts = products?.length || 0
  const availableProducts = products?.filter(p => p.status === 'available').length || 0
  const soldProducts = products?.filter(p => p.status === 'sold').length || 0
  const totalValue = products
    ?.filter(p => p.status === 'available')
    .reduce((sum, p) => sum + (p.sale_price || 0), 0) || 0

  return {
    totalProducts,
    availableProducts,
    soldProducts,
    totalValue
  }
}

// Customer Reports
export async function getCustomerReport() {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      sales_transactions (
        transaction_id,
        total_amount,
        sale_date
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTopCustomers(startDate: string, endDate: string, limit: number = 10) {
  const { data: sales, error } = await supabase
    .from('sales_transactions')
    .select(`
      customer_id,
      total_amount,
      customers (
        customer_name,
        phone_number
      )
    `)
    .gte('sale_date', startDate)
    .lte('sale_date', endDate)
    .not('customer_id', 'is', null)

  if (error) throw error

  // Group by customer
  const customerData: Record<string, any> = {}

  sales?.forEach((sale: any) => {
    const customerId = sale.customer_id
    if (!customerId) return

    if (!customerData[customerId]) {
      customerData[customerId] = {
        customerId,
        customerName: sale.customers?.customer_name || 'Unknown',
        phoneNumber: sale.customers?.phone_number || '',
        purchaseCount: 0,
        totalAmount: 0
      }
    }

    customerData[customerId].purchaseCount++
    customerData[customerId].totalAmount += sale.total_amount || 0
  })

  return Object.values(customerData)
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
}

export async function getNewCustomers(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Consignment Reports
export async function getConsignmentReport(filters?: {
  status?: string
}) {
  let query = supabase
    .from('consignments')
    .select(`
      *,
      customers (
        customer_name,
        phone_number
      )
    `)
    .order('consignment_date', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getConsignmentSummary() {
  const { data: consignments, error } = await supabase
    .from('consignments')
    .select('*')

  if (error) throw error

  const totalConsignments = consignments?.length || 0
  const activeConsignments = consignments?.filter(c => c.status === 'active').length || 0
  const expiredConsignments = consignments?.filter(c => c.status === 'expired').length || 0
  const redeemedConsignments = consignments?.filter(c => c.status === 'redeemed').length || 0
  const totalValue = consignments
    ?.filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.loan_amount || 0), 0) || 0

  // Calculate expected interest
  const expectedInterest = consignments
    ?.filter(c => c.status === 'active')
    .reduce((sum, c) => {
      const principal = c.loan_amount || 0
      const rate = c.interest_rate || 0
      // Simple interest calculation (monthly)
      const interest = (principal * rate) / 100
      return sum + interest
    }, 0) || 0

  return {
    totalConsignments,
    activeConsignments,
    expiredConsignments,
    redeemedConsignments,
    totalValue,
    expectedInterest
  }
}

export async function getExpiringConsignments(days: number = 7) {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + days)

  const { data, error } = await supabase
    .from('consignments')
    .select(`
      *,
      customers (
        customer_name,
        phone_number
      )
    `)
    .eq('status', 'active')
    .lte('due_date', futureDate.toISOString().split('T')[0])
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

// Gold Savings Reports
export async function getGoldSavingsReport(filters?: {
  status?: string
}) {
  let query = supabase
    .from('gold_savings')
    .select(`
      *,
      customers (
        customer_name,
        phone_number
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getGoldSavingsSummary() {
  const { data: savings, error } = await supabase
    .from('gold_savings')
    .select('*')

  if (error) throw error

  const totalAccounts = savings?.length || 0
  const activeAccounts = savings?.filter(s => s.status === 'active').length || 0
  const closedAccounts = savings?.filter(s => s.status === 'closed').length || 0
  const totalBalance = savings
    ?.filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.balance || 0), 0) || 0

  return {
    totalAccounts,
    activeAccounts,
    closedAccounts,
    totalBalance
  }
}

export async function getNearGoalAccounts(threshold: number = 90) {
  const { data: savings, error } = await supabase
    .from('gold_savings')
    .select(`
      *,
      customers (
        customer_name,
        phone_number
      )
    `)
    .eq('status', 'active')
    .not('target_amount', 'is', null)

  if (error) throw error

  // Filter accounts near goal
  const nearGoal = savings?.filter(s => {
    if (!s.target_amount || s.target_amount === 0) return false
    const progress = (s.balance / s.target_amount) * 100
    return progress >= threshold
  }) || []

  return nearGoal
}

export async function getGoldSavingsTransactionReport(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('gold_saving_transactions')
    .select(`
      *,
      gold_savings!inner (
        account_number,
        customers (
          customer_name
        )
      )
    `)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })

  if (error) throw error

  const deposits = data?.filter(t => t.transaction_type === 'deposit') || []
  const withdrawals = data?.filter(t => t.transaction_type === 'withdrawal') || []

  const totalDeposits = deposits.reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + (t.amount || 0), 0)

  return {
    transactions: data || [],
    depositCount: deposits.length,
    withdrawalCount: withdrawals.length,
    totalDeposits,
    totalWithdrawals
  }
}
