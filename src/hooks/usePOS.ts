'use client'

import { useState, useEffect } from 'react'
import { 
  getAvailableProducts, 
  getCurrentGoldPrice,
  createSalesTransaction,
  createSalesItems,
  createTradeInItem,
  updateProductStock
} from '@/lib/supabaseAPI'
import type { Product, GoldPrice, Customer } from '@/lib/supabase'
import toast from 'react-hot-toast'

export interface CartItem {
  product: Product
  quantity: number
  goldPricePerBaht: number  // ราคาขายออก (จากเว็บสมาคม)
  goldBuyPricePerBaht: number  // ราคารับซื้อ (จากเว็บสมาคม)
  laborCost: number  // ค่ากำเหน็จ (สามารถแก้ไขได้)
  gemCost: number  // ค่าพลอย (สามารถแก้ไขได้)
  unitPrice: number  // ราคาต่อหน่วย (คำนวณอัตโนมัติหรือแก้ไขเอง)
  lineTotal: number
  vatBase: number  // ฐาน VAT = (ราคาขาย - ราคารับซื้อ) × น้ำหนัก + ค่ากำเหน็จ + ค่าพลอย
  isCustomPrice: boolean  // true = แก้ไขราคาเอง, false = ใช้ราคาอัตโนมัติ
}

export interface TradeInItem {
  description: string
  weight_baht: number
  weight_grams: number
  gold_percentage: number
  gold_buy_price_per_baht: number
  trade_in_value: number
}

export function usePOS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [tradeIn, setTradeIn] = useState<TradeInItem | null>(null)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card' | 'mixed'>('cash')
  const [includeVat, setIncludeVat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Load products and gold price
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [productsData, goldPriceData] = await Promise.all([
        getAvailableProducts(),
        getCurrentGoldPrice()
      ])
      setProducts(productsData || [])
      setGoldPrice(goldPriceData)
    } catch (error) {
      console.error('Error loading POS data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (search: string) => {
    try {
      const data = await getAvailableProducts({ search })
      setProducts(data || [])
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('ไม่สามารถค้นหาสินค้าได้')
    }
  }

  const addToCart = (product: Product) => {
    if (!goldPrice) {
      toast.error('ไม่พบราคาทองวันนี้')
      return
    }

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product.id === product.id)
    
    if (existingIndex >= 0) {
      // Increase quantity
      const newCart = [...cart]
      const currentQty = newCart[existingIndex].quantity
      
      if (currentQty >= product.stock_quantity) {
        toast.error('สินค้าไม่เพียงพอในสต๊อก')
        return
      }
      
      newCart[existingIndex].quantity += 1
      newCart[existingIndex].lineTotal = newCart[existingIndex].unitPrice * newCart[existingIndex].quantity
      setCart(newCart)
      toast.success('เพิ่มจำนวนสินค้าแล้ว')
    } else {
      // Add new item
      const goldSellPrice = goldPrice.gold_jewelry_sell  // ราคาขายออก
      const goldBuyPrice = goldPrice.gold_jewelry_buy    // ราคารับซื้อ
      
      // ใช้ค่าจาก product หรือ default
      const laborCost = product.labor_cost || 0
      const gemCost = product.gem_cost || 0
      
      // คำนวณกำไรจากทอง
      const goldProfitPerBaht = goldSellPrice - goldBuyPrice
      const goldProfit = goldProfitPerBaht * product.weight_baht
      
      // ฐาน VAT = กำไรจากทอง + ค่ากำเหน็จ + ค่าพลอย
      const vatBase = goldProfit + laborCost + gemCost
      
      // ราคาขาย = ราคาทองขายออก + ค่าต่างๆ (Dynamic - ไม่ใช้ selling_price)
      const unitPrice = product.weight_baht * goldSellPrice + laborCost + gemCost
      
      const cartItem: CartItem = {
        product,
        quantity: 1,
        goldPricePerBaht: goldSellPrice,
        goldBuyPricePerBaht: goldBuyPrice,
        laborCost,
        gemCost,
        unitPrice,
        lineTotal: unitPrice,
        vatBase,
        isCustomPrice: false
      }
      
      setCart([...cart, cartItem])
      toast.success('เพิ่มสินค้าลงตะกร้าแล้ว')
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const cartItem = cart.find(item => item.product.id === productId)
    if (!cartItem) return

    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    if (newQuantity > cartItem.product.stock_quantity) {
      toast.error('สินค้าไม่เพียงพอในสต๊อก')
      return
    }

    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: newQuantity,
          lineTotal: item.unitPrice * newQuantity
        }
      }
      return item
    })
    
    setCart(newCart)
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
    toast.success('ลบสินค้าออกจากตะกร้าแล้ว')
  }

  const updateItemPrice = (
    productId: string, 
    newLaborCost: number, 
    newGemCost: number,
    customPrice?: number
  ) => {
    setCart(cart.map((item) => {
      if (item.product.id !== productId) return item

      const goldSellPrice = item.goldPricePerBaht
      const goldBuyPrice = item.goldBuyPricePerBaht
      
      // คำนวณกำไรจากทอง
      const goldProfitPerBaht = goldSellPrice - goldBuyPrice
      const goldProfit = goldProfitPerBaht * item.product.weight_baht
      
      // ฐาน VAT = กำไรจากทอง + ค่ากำเหน็จ + ค่าพลอย
      const vatBase = goldProfit + newLaborCost + newGemCost
      
      // ถ้ามีการตั้งราคาเอง ใช้ราคานั้น ไม่งั้นคำนวณใหม่
      const unitPrice = customPrice !== undefined 
        ? customPrice 
        : item.product.weight_baht * goldSellPrice + newLaborCost + newGemCost
      
      return {
        ...item,
        laborCost: newLaborCost,
        gemCost: newGemCost,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        vatBase,
        isCustomPrice: customPrice !== undefined
      }
    }))
    toast.success('แก้ไขราคาสินค้าแล้ว')
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setTradeIn(null)
    setDiscount(0)
    setPaymentMethod('cash')
    setIncludeVat(true)
    toast.success('ล้างรายการแล้ว')
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0)
  
  // คำนวณฐาน VAT รวมจากสินค้าทั้งหมด
  // ฐาน VAT = Σ[(ราคาขายออก - ราคารับซื้อ) × น้ำหนัก + ค่ากำเหน็จ + ค่าพลอย]
  const totalVatBase = cart.reduce((sum, item) => sum + (item.vatBase * item.quantity), 0)
  
  const discountAmount = discount
  const tradeInAmount = tradeIn?.trade_in_value || 0
  
  // ฐาน VAT สุทธิ = ฐาน VAT รวม - ส่วนลด - เทิร์นทอง
  const netVatBase = totalVatBase - discountAmount - tradeInAmount
  
  // VAT = ฐาน VAT × 0.07 (เฉพาะเมื่อเลือกรวม VAT และฐาน VAT > 0)
  const vatAmount = includeVat && netVatBase > 0 ? netVatBase * 0.07 : 0
  
  // ยอดชำระ = ราคาขายรวม - ส่วนลด - เทิร์น + VAT
  const total = subtotal - discountAmount - tradeInAmount + vatAmount

  const checkout = async (paymentDetails?: {
    cash_amount?: number
    transfer_amount?: number
    card_amount?: number
    notes?: string
  }) => {
    if (cart.length === 0) {
      toast.error('ไม่มีสินค้าในตะกร้า')
      return null
    }

    if (!goldPrice) {
      toast.error('ไม่พบราคาทองวันนี้')
      return null
    }

    setProcessing(true)
    try {
      // 1. Create sales transaction
      const transaction = await createSalesTransaction({
        customer_id: selectedCustomer?.id,
        transaction_date: new Date().toISOString(),
        subtotal,
        vat_amount: vatAmount,
        discount_amount: discountAmount,
        trade_in_amount: tradeInAmount,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'paid',
        include_vat: includeVat,
        ...paymentDetails
      })

      // 2. Create sales items
      const salesItems = cart.map(item => ({
        sales_transaction_id: transaction.id,
        product_id: item.product.id,
        product_code: item.product.product_code,
        product_name: item.product.product_name,
        weight_baht: item.product.weight_baht,
        gold_price_per_baht: item.goldPricePerBaht || goldPrice.gold_jewelry_sell,
        labor_cost: item.laborCost,  // ใช้ค่าจาก cart (อาจถูกแก้ไข)
        gem_cost: item.gemCost,  // ใช้ค่าจาก cart (อาจถูกแก้ไข)
        other_cost: item.product.other_cost || 0,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal
      }))
      
      await createSalesItems(salesItems)

      // 3. Update product stock
      for (const item of cart) {
        await updateProductStock(item.product.id, -item.quantity)
      }

      // 4. Create trade-in item if exists
      if (tradeIn) {
        await createTradeInItem({
          sales_transaction_id: transaction.id,
          ...tradeIn
        })
      }

      toast.success('บันทึกการขายสำเร็จ!')
      
      // Clear cart
      clearCart()
      
      // Reload products
      await loadInitialData()

      return transaction
    } catch (error: any) {
      console.error('Error processing checkout:', error)
      toast.error(`ไม่สามารถบันทึกการขายได้: ${error.message}`)
      return null
    } finally {
      setProcessing(false)
    }
  }

  // ตัวแปรเสริมสำหรับแสดงสูตร VAT
  const totalGoldProfitAndLabor = totalVatBase

  return {
    products,
    cart,
    goldPrice,
    selectedCustomer,
    tradeIn,
    discount,
    paymentMethod,
    includeVat,
    loading,
    processing,
    subtotal,
    discountAmount,
    tradeInAmount,
    vatAmount,
    total,
    totalVatBase,
    netVatBase,
    totalGoldProfitAndLabor,
    setSelectedCustomer,
    setTradeIn,
    setDiscount,
    setPaymentMethod,
    setIncludeVat,
    searchProducts,
    addToCart,
    updateQuantity,
    updateItemPrice,
    removeFromCart,
    clearCart,
    checkout,
    refreshProducts: loadInitialData,
  }
}

