export interface Product {
  id: string
  name: string
  description: string
  category: "carpeta1" | "carpeta2" | "carpeta3"
  priceNormal: number
  pricePremium: number
  saleType: "lista1" | "lista2"
}

export interface Client {
  id: string
  name: string
  type: "normal" | "premium"
  phone?: string
  address?: string
  name_business?: string
}

export interface OrderItem {
  productId: string
  quantity: number
  saleType?: "lista1" | "lista2"
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
