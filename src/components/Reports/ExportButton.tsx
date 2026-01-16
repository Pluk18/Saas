'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import toast from 'react-hot-toast'

interface ExportButtonProps {
  data: any[]
  filename: string
  headers?: string[]
}

export default function ExportButton({ data, filename, headers }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = () => {
    try {
      setIsExporting(true)
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Report')
      XLSX.writeFile(wb, `${filename}.xlsx`)
      toast.success('ส่งออกไฟล์ Excel สำเร็จ')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('เกิดข้อผิดพลาดในการส่งออกไฟล์')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    try {
      setIsExporting(true)
      const csv = Papa.unparse(data)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('ส่งออกไฟล์ CSV สำเร็จ')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('เกิดข้อผิดพลาดในการส่งออกไฟล์')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        disabled={isExporting || !data || data.length === 0}
        className="btn btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet size={18} />
        Excel
      </button>
      <button
        onClick={exportToCSV}
        disabled={isExporting || !data || data.length === 0}
        className="btn btn-outline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText size={18} />
        CSV
      </button>
    </div>
  )
}
