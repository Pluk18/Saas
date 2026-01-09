// API for Thai Gold Association Prices
// ดึงข้อมูลจาก https://www.goldtraders.or.th/ (สมาคมค้าทองคำไทย)

export interface GoldPriceData {
  date: string
  goldBarBuy: number
  goldBarSell: number
  goldJewelryBuy: number
  goldJewelrySell: number
  source: string
  time?: string
  updateNumber?: number
}

/**
 * ดึงราคาทองคำปัจจุบันจากสมาคมค้าทองคำไทย
 */
export async function fetchCurrentGoldPrice(): Promise<GoldPriceData> {
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
      date: result.data.date,
      goldBarBuy: result.data.goldBarBuy,
      goldBarSell: result.data.goldBarSell,
      goldJewelryBuy: result.data.goldJewelryBuy,
      goldJewelrySell: result.data.goldJewelrySell,
      source: result.data.source,
      time: result.data.time,
      updateNumber: result.data.updateNumber,
    }
  } catch (error) {
    console.error('Error fetching gold price:', error)
    
    // Fallback to mock data if API fails
    console.log('Using fallback mock data')
    return {
      date: new Date().toISOString().split('T')[0],
      goldBarBuy: 64200,
      goldBarSell: 64300,
      goldJewelryBuy: 62914,
      goldJewelrySell: 65100,
      source: 'fallback_mock',
    }
  }
}

/**
 * ดึงประวัติราคาทอง (Mock)
 */
export async function fetchGoldPriceHistory(days: number = 7): Promise<GoldPriceData[]> {
  await new Promise(resolve => setTimeout(resolve, 800))

  const history: GoldPriceData[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const basePrice = 38800 - (i * 50) // ลดลงทีละ 50 บาทต่อวัน
    const randomVar = Math.floor(Math.random() * 100)

    history.push({
      date: date.toISOString().split('T')[0],
      goldBarBuy: basePrice + randomVar,
      goldBarSell: basePrice + 200 + randomVar,
      goldJewelryBuy: basePrice - 500 + randomVar,
      goldJewelrySell: basePrice + 700 + randomVar,
      source: 'thai_gold_association_mock'
    })
  }

  return history
}

/**
 * บันทึกราคาทองลง Supabase
 */
export async function saveGoldPriceToDatabase(priceData: GoldPriceData) {
  // TODO: Implement Supabase insert
  console.log('Saving gold price to database:', priceData)
}

