export const runtime = 'nodejs';
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { cliente_id: string } }) {
  const clientId = params.cliente_id
  try {
    // Buscar pedidos con detalles y sus relaciones (producto y lista_precio)
    const orders = await prisma.pedido.findMany({
      where: { cliente_id: Number(clientId) },
      include: {
        detalle_pedido: {
          include: {
            producto: true,
            lista_precio: true,
          }
        },
        estado_pedido: true,
      },
      orderBy: { fecha: 'desc' },
    })

    // Formatear respuesta para el frontend
    const formattedOrders = orders.map(order => ({
      id: order.id.toString(),
      clientId: order.cliente_id.toString(),
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
      dateCreated: order.fecha.toISOString(),
      items: order.detalle_pedido.map(item => ({
        id: item.id.toString(),
        productId: item.producto_id.toString(),
        productName: item.producto.nombre || 'Producto sin nombre',
        quantity: Number(item.cantidad),
        unitPrice: Number(item.precio_unitario),
        subtotal: item.subtotal ? Number(item.subtotal) : Number(item.precio_unitario) * Number(item.cantidad),
        saleType: item.lista_precio.nombre || 'lista desconocida',
      })),
      total: order.detalle_pedido.reduce((sum, item) => sum + (item.subtotal ? Number(item.subtotal) : Number(item.precio_unitario) * Number(item.cantidad)), 0),
      status: order.estado_pedido?.nombre || 'unknown',
    }))

    return NextResponse.json({ orders: formattedOrders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Error fetching client orders' }, { status: 500 })
  }
}
