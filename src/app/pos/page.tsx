'use client'

import MainLayout from '@/components/Layout/MainLayout'
import CustomerSelectModal from '@/components/POS/CustomerSelectModal'
import TradeInModal from '@/components/POS/TradeInModal'
import CheckoutModal from '@/components/POS/CheckoutModal'
import EditPriceModal from '@/components/POS/EditPriceModal'
import { usePOS } from '@/hooks/usePOS'
import type { CartItem } from '@/hooks/usePOS'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  User, 
  Search,
  Percent,
  RefreshCw,
  Receipt,
  ArrowLeftRight,
  Edit,
  Lightbulb,
  Coins
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function POSPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Gold Credit Mode
  const [goldCreditMode, setGoldCreditMode] = useState(false)
  const [goldCredit, setGoldCredit] = useState({
    saving_id: '',
    customer_id: '',
    customer_name: '',
    credit_amount: 0,
    transaction_date: '',
  })

  const {
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
  } = usePOS()

  // Check if opened from gold savings withdrawal (after usePOS hook)
  useEffect(() => {
    if (searchParams.get('mode') === 'gold_credit') {
      const customerId = searchParams.get('customer_id') || ''
      const customerName = searchParams.get('customer_name') || ''
      
      setGoldCreditMode(true)
      setGoldCredit({
        saving_id: searchParams.get('saving_id') || '',
        customer_id: customerId,
        customer_name: customerName,
        credit_amount: parseFloat(searchParams.get('credit_amount') || '0'),
        transaction_date: searchParams.get('transaction_date') || '',
      })
      
      // Lock payment method to gold_credit
      setPaymentMethod('gold_credit')

      // Auto-select customer
      if (customerId && customerName) {
        setSelectedCustomer({
          id: customerId,
          customer_code: '',
          first_name: customerName.split(' ')[0] || '',
          last_name: customerName.split(' ').slice(1).join(' ') || '',
          phone: '',
          email: '',
        })
      }
    }
  }, [searchParams]) // setSelectedCustomer is stable, no need in deps

  const [searchQuery, setSearchQuery] = useState('')
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false)
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null)
  const [showDiscountInput, setShowDiscountInput] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      searchProducts(query)
    } else if (query.length === 0) {
      searchProducts('')
    }
  }

  const handleCheckout = async (paymentDetails: any) => {
    // Save state before checkout (because clearCart will reset everything)
    const isGoldCreditMode = goldCreditMode
    const currentTotal = total
    const currentGoldCredit = { ...goldCredit }
    
    const result = await checkout(paymentDetails)
    if (result) {
      // If gold credit mode, create withdrawal transaction
      if (isGoldCreditMode && currentGoldCredit.saving_id) {
        try {
          const { createGoldSavingWithdrawal } = await import('@/lib/supabaseAPI')
          
          // Create product description from cart
          const productDescription = cart.map((item) => 
            `${item.product.product_name} ${formatNumber(item.product.weight_baht, 3)} บาท (x${item.quantity})`
          ).join(', ')

          await createGoldSavingWithdrawal({
            gold_saving_id: currentGoldCredit.saving_id,
            transaction_date: currentGoldCredit.transaction_date,
            amount: currentGoldCredit.credit_amount,
            withdrawal_type: 'gold',
            product_description: productDescription,
            notes: `ขายผ่าน POS Transaction ID: ${result.id}`,
          })

          toast.success('บันทึกการถอนทองสำเร็จ')
        } catch (error: any) {
          console.error('Error creating withdrawal:', error)
          toast.error('บันทึกการขายสำเร็จ แต่ไม่สามารถบันทึกการถอนทอง: ' + error.message)
        }
      }
      
      setIsCheckoutModalOpen(false)
      
      // Show success message with gold credit info and clear mode
      if (isGoldCreditMode) {
        const paymentAmount = Math.max(0, currentTotal - currentGoldCredit.credit_amount)
        const refundAmount = Math.max(0, currentGoldCredit.credit_amount - currentTotal)
        
        if (refundAmount > 0) {
          toast.success(`ขายสำเร็จ! คืนเงิน: ${formatCurrency(refundAmount)} | กลับสู่โหมดปกติ`, { duration: 3000 })
        } else if (paymentAmount > 0) {
          toast.success(`ขายสำเร็จ! รับเงินเพิ่ม: ${formatCurrency(paymentAmount)} | กลับสู่โหมดปกติ`, { duration: 3000 })
        } else {
          toast.success('ขายสำเร็จ! จ่ายด้วยเครดิตทองครบถ้วน | กลับสู่โหมดปกติ', { duration: 3000 })
        }
        
        // Clear gold credit mode and URL params (soft navigation)
        setGoldCreditMode(false)
        setGoldCredit({
          saving_id: '',
          customer_id: '',
          customer_name: '',
          credit_amount: 0,
          transaction_date: '',
        })
        router.replace('/pos')
      }
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              ขายสินค้า (POS)
              {goldCreditMode && (
                <span className="ml-3 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-base rounded-full">
                  <Coins size={18} />
                  แลกจากออมทอง
                </span>
              )}
            </h1>
            <p className="text-neutral-600">
              {goldCreditMode 
                ? `ลูกค้า: ${goldCredit.customer_name} | เครดิต: ${formatCurrency(goldCredit.credit_amount)}`
                : 'ระบบขายหน้าร้าน Point of Sale'
              }
            </p>
          </div>
          {goldPrice && (
            <div className="text-right">
              <p className="text-sm text-neutral-600">ราคาทองวันนี้</p>
              <p className="text-lg font-bold text-primary-700">
                {formatCurrency(goldPrice.gold_jewelry_sell)}/บาท
              </p>
            </div>
          )}
        </div>

        {/* Gold Credit Info */}
        {goldCreditMode && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
                  <Coins size={20} />
                  เครดิตทองจากออมทอง
                </h3>
                <p className="text-sm text-amber-800">
                  เครดิต: <strong className="text-lg">{formatCurrency(goldCredit.credit_amount)}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-700">เครดิตคงเหลือ</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(goldCredit.credit_amount - total > 0 ? goldCredit.credit_amount - total : 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า (รหัสสินค้า, ชื่อสินค้า, สแกน Barcode...)"
                  className="input text-lg pl-11"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Dynamic Pricing Info */}
            {goldPrice && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      💡 ราคาอัปเดตอัตโนมัติ
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      ระบบคำนวณราคาขายจากราคาทองวันนี้ ({formatCurrency(goldPrice.gold_jewelry_sell)}/บาท) 
                      โดยอัตโนมัติ • คุณสามารถ <span className="font-semibold">แก้ไขราคาได้</span> โดยกดปุ่ม 
                      <Edit size={12} className="inline mx-1 text-blue-600" /> ในตะกร้าสินค้า
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-neutral-800">
                  เลือกสินค้า ({products.length})
                </h3>
                <button
                  onClick={() => handleSearch('')}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  รีเฟรช
                </button>
              </div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-neutral-600">กำลังโหลดสินค้า...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>ไม่พบสินค้า</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {products.map((product) => {
                    const price = product.selling_price || 
                      (goldPrice ? product.weight_baht * goldPrice.gold_jewelry_sell + product.labor_cost : 0)
                    
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 
                                 hover:shadow-md transition-all text-left"
                      >
                        <p className="text-xs text-neutral-500 mb-1">{product.product_code}</p>
                        <p className="font-medium text-neutral-900 mb-2 line-clamp-2">
                          {product.product_name}
                        </p>
                        <p className="text-sm text-neutral-600 mb-1">
                          {formatNumber(product.weight_baht, 2)} บาท
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-primary-700">
                            {formatCurrency(price)}
                          </p>
                          <span className="text-xs text-neutral-500">
                            คงเหลือ: {product.stock_quantity}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                รายการสินค้า ({cart.length})
              </h3>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>ยังไม่มีสินค้าในตะกร้า</p>
                  <p className="text-sm mt-1">เลือกสินค้าเพื่อเริ่มการขาย</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.product.product_name}</p>
                            {item.isCustomPrice && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                🎯 ราคาพิเศษ
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600">
                            {item.product.product_code} • {formatNumber(item.product.weight_baht, 2)} บาท
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            ราคาทอง: {formatCurrency(item.goldPricePerBaht)}/บาท + ค่ากำเหน็จ: {formatCurrency(item.laborCost)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className="font-bold text-primary-700">
                            {formatCurrency(item.lineTotal)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatCurrency(item.unitPrice)}/ชิ้น
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedCartItem(item)
                            setIsEditPriceModalOpen(true)
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-600 flex items-center justify-center"
                          title="แก้ไขราคา"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                ข้อมูลลูกค้า
              </h3>
              {selectedCustomer ? (
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="font-semibold text-white">
                          {selectedCustomer.first_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </p>
                        <p className="text-sm text-neutral-600">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      เปลี่ยน
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="w-full btn btn-outline"
                >
                  <User size={18} />
                  เลือกลูกค้า
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                สรุปยอด
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">ยอดรวม</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                {/* Discount */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">ส่วนลด</span>
                  {showDiscountInput ? (
                    <input
                      type="number"
                      className="input w-32 text-right py-1"
                      value={discount || ''}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      onBlur={() => setShowDiscountInput(false)}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setShowDiscountInput(true)}
                      className="font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Percent size={14} />
                      -{formatCurrency(discountAmount)}
                    </button>
                  )}
                </div>

                {/* Trade-in */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">เทิร์นทอง</span>
                  {tradeIn ? (
                    <div className="text-right">
                      <p className="font-medium text-red-600">-{formatCurrency(tradeInAmount)}</p>
                      <button
                        onClick={() => setIsTradeInModalOpen(true)}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        แก้ไข
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsTradeInModalOpen(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <ArrowLeftRight size={14} />
                      เพิ่มเทิร์น
                    </button>
                  )}
                </div>

                {/* Gold Credit */}
                {goldCreditMode && (
                  <div className="flex justify-between items-center bg-amber-50 border border-amber-300 rounded-lg p-2 -mx-2">
                    <div className="flex items-center gap-2">
                      <Coins size={16} className="text-amber-700" />
                      <span className="text-amber-900 font-medium">เครดิตทอง</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-900">-{formatCurrency(goldCredit.credit_amount)}</p>
                    </div>
                  </div>
                )}

                {/* VAT Toggle */}
                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeVat"
                        checked={includeVat}
                        onChange={(e) => setIncludeVat(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor="includeVat" className="text-neutral-700 cursor-pointer select-none font-medium">
                        รวม VAT 7%
                      </label>
                    </div>
                    <span className={`font-semibold ${includeVat ? 'text-green-600' : 'text-neutral-400 line-through'}`}>
                      {includeVat ? '+' : ''}{formatCurrency(vatAmount)}
                    </span>
                  </div>
                  {/* แสดงสูตรการคำนวณ VAT พร้อมแทนค่า */}
                  {cart.length > 0 && (() => {
                    const totalVatBaseBeforeDeduction = cart.reduce((sum, item) => sum + (item.vatBase * item.quantity), 0)
                    const netVatBase = Math.max(0, totalVatBaseBeforeDeduction - discountAmount - tradeInAmount)
                    
                    return (
                      <div className="mt-2 pl-6 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs space-y-1.5">
                        <div className="font-mono text-neutral-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-neutral-600">ฐาน VAT:</span>
                            <span className="font-semibold text-primary-700">
                              {formatCurrency(netVatBase)}
                            </span>
                          </div>
                          <div className="text-neutral-600 space-y-0.5">
                            <p>= ({formatCurrency(totalVatBaseBeforeDeduction)}</p>
                            <p className="pl-4">- {formatCurrency(discountAmount)}</p>
                            <p className="pl-4">- {formatCurrency(tradeInAmount)}) × 0.07</p>
                          </div>
                        </div>
                        <p className="text-neutral-500 italic pt-1 border-t border-amber-300">
                          💡 กำไรทอง + ค่ากำเหน็จ - ส่วนลด - เทิร์น
                        </p>
                      </div>
                    )
                  })()}
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  {goldCreditMode && (
                    <div className="mb-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">ยอดรวมก่อนหักเครดิต</span>
                        <span className="font-medium">{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700 font-medium">หัก: เครดิตทอง</span>
                        <span className="text-amber-700 font-medium">-{formatCurrency(goldCredit.credit_amount)}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-semibold text-neutral-800">
                      {goldCreditMode ? 'ยอดชำระเพิ่ม' : 'ยอดชำระทั้งหมด'}
                    </span>
                    <span className={`text-2xl font-bold font-display ${
                      goldCreditMode && (total - goldCredit.credit_amount) < 0 
                        ? 'text-green-600' 
                        : 'text-primary-700'
                    }`}>
                      {goldCreditMode 
                        ? formatCurrency(Math.max(0, total - goldCredit.credit_amount))
                        : formatCurrency(total)
                      }
                    </span>
                  </div>
                  {goldCreditMode && (total - goldCredit.credit_amount) < 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-1">
                        <span>💰</span>
                        <span>คืนเงิน: {formatCurrency(Math.abs(total - goldCredit.credit_amount))}</span>
                      </p>
                    </div>
                  )}
                  {!includeVat && (
                    <p className="text-xs text-amber-600 mt-2 text-right flex items-center justify-end gap-1">
                      <span>⚠️</span>
                      <span>ราคายังไม่รวม VAT</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h3 className="text-lg font-display font-semibold text-neutral-800 mb-4">
                วิธีชำระเงิน
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {goldCreditMode ? (
                  // Gold Credit Mode - ล็อควิธีชำระเป็นเครดิตออมทองเท่านั้น
                  <button
                    disabled
                    className="col-span-2 btn flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-600 cursor-not-allowed opacity-100"
                  >
                    <Coins size={18} />
                    เครดิตออมทอง (ล็อคแล้ว)
                  </button>
                ) : (
                  // Normal Mode - แสดงวิธีชำระทั้งหมด
                  <>
                    {[
                      { value: 'cash', label: 'เงินสด' },
                      { value: 'transfer', label: 'โอนเงิน' },
                      { value: 'card', label: 'บัตรเครดิต' },
                      { value: 'mixed', label: 'ผสม' }
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`btn ${
                          paymentMethod === method.value ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={cart.length === 0 || processing}
                className="w-full btn btn-success text-lg font-semibold py-3"
              >
                <Receipt size={20} />
                {processing ? 'กำลังบันทึก...' : 'ชำระเงิน'}
              </button>
              <button 
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full btn btn-outline"
              >
                <X size={18} />
                ล้างรายการ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={setSelectedCustomer}
        selectedCustomer={selectedCustomer}
      />

      <TradeInModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        onSave={setTradeIn}
        goldPrice={goldPrice}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleCheckout}
        total={total}
        paymentMethod={paymentMethod}
        goldCreditMode={goldCreditMode}
        goldCreditAmount={goldCredit.credit_amount}
      />

      <EditPriceModal
        isOpen={isEditPriceModalOpen}
        onClose={() => {
          setIsEditPriceModalOpen(false)
          setSelectedCartItem(null)
        }}
        item={selectedCartItem}
        onSave={(laborCost, gemCost, customPrice) => {
          if (selectedCartItem) {
            updateItemPrice(selectedCartItem.product.id, laborCost, gemCost, customPrice)
          }
        }}
      />
    </MainLayout>
  )
}

