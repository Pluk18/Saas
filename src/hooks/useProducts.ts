'use client'

import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/supabaseAPI'
import type { Product } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useProducts(filters?: {
  category?: string
  status?: string
  search?: string
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts(filters)
      setProducts(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters?.category, filters?.status, filters?.search])

  const addProduct = async (productData: any) => {
    try {
      const newProduct = await createProduct(productData)
      toast.success('เพิ่มสินค้าสำเร็จ')
      fetchProducts()
      return newProduct
    } catch (err) {
      toast.error('ไม่สามารถเพิ่มสินค้าได้')
      throw err
    }
  }

  const editProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await updateProduct(id, updates)
      toast.success('แก้ไขสินค้าสำเร็จ')
      fetchProducts()
      return updated
    } catch (err) {
      toast.error('ไม่สามารถแก้ไขสินค้าได้')
      throw err
    }
  }

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      toast.success('ลบสินค้าสำเร็จ')
      fetchProducts()
    } catch (err) {
      toast.error('ไม่สามารถลบสินค้าได้')
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  }
}

