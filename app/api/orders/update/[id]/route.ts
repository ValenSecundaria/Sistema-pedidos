// app/api/orders/update/[id]/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: {
        cliente: true,
        estado_pedido: true,
        detalle_pedido: {
          include: {
            producto: true,
            lista_precio: true,
          },
        },
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // Normalizar decimales a string para el frontend
    const detalle = pedido.detalle_pedido.map(d => ({
      id: d.id,
      producto_id: d.producto_id,
      producto_name: d.producto ? d.producto.nombre : null,
      cantidad:
        typeof d.cantidad === 'object' && typeof d.cantidad.toString === 'function'
          ? d.cantidad.toString()
          : String(d.cantidad),
      lista_precio_id: d.lista_precio_id,
      lista_precio_name: d.lista_precio ? d.lista_precio.nombre : null,
      precio_unitario:
        typeof d.precio_unitario === 'object' && typeof d.precio_unitario.toString === 'function'
          ? d.precio_unitario.toString()
          : String(d.precio_unitario),
      subtotal: d.subtotal ? (typeof d.subtotal === 'object' ? d.subtotal.toString() : String(d.subtotal)) : null,
    }))

    return NextResponse.json({
      id: pedido.id.toString(),
      cliente_id: pedido.cliente_id,
      fecha: pedido.fecha.toISOString(),
      observaciones: pedido.observaciones ?? null,
      estado_pedido_id: pedido.estado_pedido_id ?? null,
      estado_pedido_name: pedido.estado_pedido?.nombre ?? null,
      detalle_pedido: detalle,
    })
  } catch (e) {
    console.error('GET /api/orders/update/[id] error:', e)
    return NextResponse.json({ error: 'Error al obtener pedido detallado' }, { status: 500 })
  }
}
