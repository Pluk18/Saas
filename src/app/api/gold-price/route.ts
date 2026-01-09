import { NextResponse } from 'next/server'

/**
 * API Route สำหรับดึงราคาทองจากสมาคมค้าทองคำไทย
 * https://www.goldtraders.or.th/
 */

interface GoldPriceResponse {
  success: boolean
  data?: {
    date: string
    time: string
    updateNumber: number
    goldBarBuy: number
    goldBarSell: number
    goldJewelryBuy: number
    goldJewelrySell: number
    source: string
  }
  error?: string
}

export async function GET() {
  try {
    // ดึงข้อมูลจากเว็บไซต์สมาคมค้าทองคำไทย
    const response = await fetch('https://www.goldtraders.or.th/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store', // ไม่ cache เพื่อให้ได้ข้อมูลล่าสุดเสมอ
    })

    if (!response.ok) {
      throw new Error('Failed to fetch gold price')
    }

    const html = await response.text()

    // Parse ข้อมูลราคาจาก HTML
    const goldPriceData = parseGoldPrice(html)

    if (!goldPriceData) {
      throw new Error('Failed to parse gold price data')
    }

    const result: GoldPriceResponse = {
      success: true,
      data: goldPriceData,
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache 5 นาที
      },
    })
  } catch (error: any) {
    console.error('Error fetching gold price:', error)
    
    const result: GoldPriceResponse = {
      success: false,
      error: error.message || 'Unknown error',
    }

    return NextResponse.json(result, { status: 500 })
  }
}

/**
 * Parse ข้อมูลราคาทองจาก HTML
 */
function parseGoldPrice(html: string) {
  try {
    console.log('=== Parsing Gold Price from HTML ===')
    
    // Extract วันที่และเวลา จาก <span id="..."><b><font>19/12/2568 เวลา 16:43 น. (ครั้งที่ 5)</font></b></span>
    const dateMatch = html.match(/(\d{2}\/\d{2}\/\d{4})\s+เวลา\s+(\d{2}:\d{2})\s+น\.\s+\(ครั้งที่\s+(\d+)\)/)
    
    // Extract ราคาทองคำแท่ง ขายออก จาก lblBLSell
    // <span id="DetailPlace_uc_goldprices1_lblBLSell"><b><font color="Green">64,450.00</font></b></span>
    const goldBarSellMatch = html.match(/lblBLSell[^>]*>.*?([0-9,]+\.\d{2})/s)
    
    // Extract ราคาทองคำแท่ง รับซื้อ จาก lblBLBuy
    // <span id="DetailPlace_uc_goldprices1_lblBLBuy"><b><font color="Green">64,350.00</font></b></span>
    const goldBarBuyMatch = html.match(/lblBLBuy[^>]*>.*?([0-9,]+\.\d{2})/s)
    
    // Extract ราคาทองรูปพรรณ ขายออก จาก lblOMSell
    // <span id="DetailPlace_uc_goldprices1_lblOMSell"><b><font color="Green">65,250.00</font></b></span>
    const goldJewelrySellMatch = html.match(/lblOMSell[^>]*>.*?([0-9,]+\.\d{2})/s)
    
    // Extract ฐานภาษี (ราคารับซื้อทองรูปพรรณ) จาก lblOMBuy
    // <span id="DetailPlace_uc_goldprices1_lblOMBuy"><b><font color="Green">63,065.60</font></b></span>
    const taxBaseMatch = html.match(/lblOMBuy[^>]*>.*?([0-9,]+\.\d{2})/s)
    
    console.log('Date Match:', dateMatch?.[0])
    console.log('Gold Bar Sell:', goldBarSellMatch?.[1])
    console.log('Gold Bar Buy:', goldBarBuyMatch?.[1])
    console.log('Gold Jewelry Sell:', goldJewelrySellMatch?.[1])
    console.log('Tax Base (Jewelry Buy):', taxBaseMatch?.[1])
    
    if (!dateMatch || !goldBarSellMatch || !goldBarBuyMatch || !goldJewelrySellMatch) {
      console.error('Failed to match gold price patterns')
      console.error('Missing:', {
        date: !dateMatch,
        goldBarSell: !goldBarSellMatch,
        goldBarBuy: !goldBarBuyMatch,
        goldJewelrySell: !goldJewelrySellMatch
      })
      return null
    }

    const dateStr = dateMatch[1] // DD/MM/YYYY (พ.ศ.)
    const timeStr = dateMatch[2] // HH:MM
    const updateNumber = parseInt(dateMatch[3])

    // แปลงวันที่จาก Buddhist Era (พ.ศ.) เป็น Christian Era (ค.ศ.)
    const [day, month, yearBE] = dateStr.split('/')
    const yearCE = parseInt(yearBE) - 543
    const isoDate = `${yearCE}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    const goldBarSell = parseFloat(goldBarSellMatch[1].replace(/,/g, ''))
    const goldBarBuy = parseFloat(goldBarBuyMatch[1].replace(/,/g, ''))
    const goldJewelrySell = parseFloat(goldJewelrySellMatch[1].replace(/,/g, ''))
    
    // ราคารับซื้อทองรูปพรรณ = ฐานภาษี (ถ้ามี) หรือหัก 2% จากราคารับซื้อทองแท่ง
    let goldJewelryBuy = goldBarBuy * 0.98 // default: หัก 2%
    
    if (taxBaseMatch) {
      // ใช้ฐานภาษีเป็นราคารับซื้อทองรูปพรรณ (ถูกต้องที่สุด)
      goldJewelryBuy = parseFloat(taxBaseMatch[1].replace(/,/g, ''))
    }

    const result = {
      date: isoDate,
      time: timeStr,
      updateNumber,
      goldBarBuy,
      goldBarSell,
      goldJewelryBuy,
      goldJewelrySell,
      source: 'thai_gold_association',
    }
    
    console.log('=== Parsed Gold Price ===')
    console.log(JSON.stringify(result, null, 2))
    
    return result
  } catch (error) {
    console.error('Error parsing gold price:', error)
    return null
  }
}

