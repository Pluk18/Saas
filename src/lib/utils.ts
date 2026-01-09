// Utility functions for Gold Jewelry POS

/**
 * แปลงน้ำหนักจากบาทเป็นกรัม (96.5% gold standard)
 * 1 บาท = 15.244 กรัม (สำหรับทอง 96.5%)
 */
export function bahtToGrams(baht: number): number {
  return baht * 15.244
}

/**
 * แปลงน้ำหนักจากกรัมเป็นบาท
 */
export function gramsToBaht(grams: number): number {
  return grams / 15.244
}

/**
 * คำนวณราคาทองตามน้ำหนัก
 */
export function calculateGoldPrice(weightBaht: number, pricePerBaht: number): number {
  return weightBaht * pricePerBaht
}

/**
 * คำนวณ VAT 7%
 */
export function calculateVAT(amount: number): number {
  return amount * 0.07
}

/**
 * คำนวณราคาขายรวม (ราคาทอง + ค่ากำเหน็จ + ค่าพลอย)
 */
export function calculateSellingPrice(
  weightBaht: number,
  goldPricePerBaht: number,
  laborCost: number,
  gemCost: number = 0,
  otherCost: number = 0
): number {
  const goldPrice = calculateGoldPrice(weightBaht, goldPricePerBaht)
  return goldPrice + laborCost + gemCost + otherCost
}

/**
 * คำนวณดอกเบี้ยขายฝาก (รายเดือน)
 */
export function calculateMonthlyInterest(
  principal: number,
  interestRate: number,
  months: number
): number {
  return principal * (interestRate / 100) * months
}

/**
 * คำนวณดอกเบี้ยขายฝาก (รายวัน)
 */
export function calculateDailyInterest(
  principal: number,
  interestRate: number,
  days: number
): number {
  const monthlyRate = interestRate / 100
  const dailyRate = monthlyRate / 30
  return principal * dailyRate * days
}

/**
 * Format ตัวเลขเป็นเงินบาท
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format ตัวเลงทั่วไป
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format น้ำหนักทอง (บาท)
 */
export function formatWeight(baht: number): string {
  return `${formatNumber(baht, 3)} บาท`
}

/**
 * Format วันที่แบบไทย
 */
export function formatThaiDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format วันที่และเวลาแบบไทย
 */
export function formatThaiDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * สร้างรหัสอ้างอิง (เช่น INV-20241219-001)
 */
export function generateReferenceCode(prefix: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${year}${month}${day}-${random}`
}

/**
 * คำนวณจำนวนวันระหว่างสองวันที่
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * คำนวณจำนวนเดือนระหว่างสองวันที่
 */
export function monthsBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  const months = (end.getFullYear() - start.getFullYear()) * 12
  return months + end.getMonth() - start.getMonth()
}

/**
 * ตรวจสอบเลขบัตรประชาชน (Thai ID Card validation)
 */
export function validateThaiID(idCard: string): boolean {
  if (!/^\d{13}$/.test(idCard)) return false
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idCard.charAt(i)) * (13 - i)
  }
  
  const mod = sum % 11
  const checkDigit = (11 - mod) % 10
  
  return checkDigit === parseInt(idCard.charAt(12))
}

/**
 * ตรวจสอบเบอร์โทรศัพท์ไทย
 */
export function validateThaiPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Thai phone numbers: 10 digits starting with 0
  // Mobile: 06x, 08x, 09x
  // Landline: 02, 03x, 04x, 05x, 07x
  return /^0[2-9]\d{8}$/.test(cleaned)
}

/**
 * Format เบอร์โทรศัพท์ไทย (xxx-xxx-xxxx)
 */
export function formatThaiPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

