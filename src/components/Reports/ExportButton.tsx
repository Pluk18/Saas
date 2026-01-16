'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

interface ExportButtonProps {
  data: any[]
  filename: string
  columns?: { key: string; label: string }[]
}

export default function ExportButton({ data, filename, columns }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const prepareData = () => {
    if (!columns) return data

    return data.map(row => {
      const newRow: any = {}
      columns.forEach(col => {
        newRow[col.label] = row[col.key]
      })
      return newRow
    })
  }

  const exportToExcel = () => {
    const exportData = prepareData()
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    
    // Auto-size columns
    const max_width = 30
    const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: max_width }))
    ws['!cols'] = cols
    
    XLSX.writeFile(wb, `${filename}.xlsx`)
    setIsOpen(false)
  }

  const exportToCSV = () => {
    const exportData = prepareData()
    const csv = Papa.unparse(exportData, {
      quotes: true,
      delimiter: ',',
      header: true
    })
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline flex items-center gap-2"
        disabled={!data || data.length === 0}
      >
        <Download size={18} />
        ดาวน์โหลด
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 overflow-hidden">
            <button
              onClick={exportToExcel}
              className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors"
            >
              <FileSpreadsheet size={18} className="text-green-600" />
              <div>
                <div className="font-medium text-neutral-900">Excel</div>
                <div className="text-xs text-neutral-500">.xlsx</div>
              </div>
            </button>
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center gap-3 transition-colors border-t border-neutral-100"
            >
              <FileText size={18} className="text-blue-600" />
              <div>
                <div className="font-medium text-neutral-900">CSV</div>
                <div className="text-xs text-neutral-500">.csv</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
