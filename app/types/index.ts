export interface Product {
  id: string
  name: string
  description: string
  category: string
  priceNormal: number
  pricePremium: number
  saleType: string
}

export interface ClientInput {
  name: string
  type: string
  phone?: string
  address?: string
  name_business?: string
  neighborhood?: string
}

export interface Client extends ClientInput {
  id: string
}

export interface OrderItem {
  productId: string
  quantity: number
  saleType?: string
}

export interface Order {
  id: string
  clientId: string
  items: OrderItem[]
  dateCreated: string // ISO string
  subtotalItems: number[] // cada item = cantidad * precio
  total: number
}

export interface AuthUser {
  email: string
  token: string
}

export interface Category {
  id: number
  nombre: string
}

export interface RawProduct {
  id: number | string
  name: string
  description?: string | null
  category?: string | null
  priceNormal: number
}

export interface ClientType {
  id: number
  nombre: string
}

