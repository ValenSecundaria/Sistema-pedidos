import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        detalle_pedido: true,
        estado_pedido: true,
      },
      orderBy: { fecha: 'desc' },
    })

    const orders = pedidos.map(p => ({
      id: p.id.toString(),
      clientId: p.cliente_id.toString(),
      dateCreated: p.fecha.toISOString(),
      total: p.detalle_pedido.reduce(
        (sum, d) => sum + Number(d.cantidad) * Number(d.precio_unitario),
        0
      ),
      estadoPedidoId: p.estado_pedido?.id ?? 1,
      estadoPedidoName: p.estado_pedido?.nombre ?? 'Pendiente',
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return NextResponse.error()
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientId,
      items,
      subtotalItems,
      //total,
      dateCreated,
    }: {
      clientId: string
      items: {
        productId: string
        quantity: number
      }[]
      subtotalItems: number[]
      total: number
      dateCreated: string
    } = body

    if (!clientId || !items || items.length === 0) {
      return new NextResponse('Datos incompletos', { status: 400 })
    }

    const nuevoPedido = await prisma.pedido.create({
      data: {
        cliente_id: parseInt(clientId),
        fecha: new Date(dateCreated),
        estado_pedido_id: 1,
      },
    })

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const subtotal = subtotalItems[i] ?? 0

      const producto = await prisma.producto.findUnique({
        where: { id: parseInt(item.productId) },
      })

      if (!producto) continue

      await prisma.detalle_pedido.create({
        data: {
          pedido_id: nuevoPedido.id,
          producto_id: producto.id,
          cantidad: item.quantity,
          precio_unitario: subtotal / item.quantity,
          lista_precio_id: 1, // ajusta según cliente si es necesario
          // ❌ NO enviar subtotal si es campo generado
        },
      })
    }

    return NextResponse.json({ mensaje: 'Pedido guardado', pedidoId: nuevoPedido.id }, { status: 201 })
  } catch (error) {
    console.error('Error al guardar el pedido:', error)
    return new NextResponse('Error del servidor', { status: 500 })
  }
}
