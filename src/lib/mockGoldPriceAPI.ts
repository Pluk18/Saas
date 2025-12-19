// Mock API for Thai Gold Association Prices
// ใน Production จริงจะเชื่อมต่อกับ API ของสมาคมค้าทองคำ

export interface GoldPriceData {
  date: string
  goldBarBuy: number
  goldBarSell: number
  goldJewelryBuy: number
  goldJewelrySell: number
  source: string
}

/**
 * ดึงราคาทองคำปัจจุบัน (Mock)
 */
export async function fetchCurrentGoldPrice(): Promise<GoldPriceData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Base price with some random variation
  const baseBarBuy = 38800
  const variation = Math.floor(Math.random() * 200) - 100 // -100 to +100
  
  return {
    date: new Date().toISOString(),
    goldBarBuy: baseBarBuy + variation,
    goldBarSell: baseBarBuy + 200 + variation,
    goldJewelryBuy: baseBarBuy - 500 + variation,
    goldJewelrySell: baseBarBuy + 700 + variation,
    source: 'thai_gold_association_mock'
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

