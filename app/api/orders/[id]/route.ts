export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)
  const { stateId } = await req.json()

  if (![1, 2, 3].includes(stateId)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    const updated = await prisma.pedido.update({
      where: { id: orderId },
      data: { estado_pedido_id: stateId },
      include: { estado_pedido: true },
    })
    return NextResponse.json({
      estadoPedidoId: updated.estado_pedido_id,
      estadoPedidoName: updated.estado_pedido?.nombre ?? "—",
    })
  } catch (e) {
    console.error("PATCH /api/orders/[id] error:", e)
    return NextResponse.json({ error: "No se pudo actualizar el pedido" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)
  try {
    const p = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { cliente: true, estado_pedido: true, detalle_pedido: true },
    })
    if (!p) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }
    const total = p.detalle_pedido.reduce(
      (sum: number, d: { cantidad: any; precio_unitario: any }) =>
        sum +
        (typeof d.cantidad === "object" && typeof d.cantidad.toNumber === "function"
          ? d.cantidad.toNumber()
          : Number(d.cantidad)) *
        (typeof d.precio_unitario === "object" && typeof d.precio_unitario.toNumber === "function"
          ? d.precio_unitario.toNumber()
          : Number(d.precio_unitario)),
      0
    )
    return NextResponse.json({
      id: p.id.toString(),
      clientId: p.cliente_id.toString(),
      dateCreated: p.fecha.toISOString(),
      total,
      estadoPedidoId: p.estado_pedido_id,
      estadoPedidoName: p.estado_pedido?.nombre ?? "—",
    })
  } catch (e) {
    console.error("GET /api/orders/[id] error:", e)
    return NextResponse.json({ error: "Error al obtener el pedido" }, { status: 500 })
  }
}

// POST: actualizar/editar el pedido completo (detalles incluidos)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)
  let body: any = null
  try {
    body = await req.json()
  } catch (e) {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const {
    cliente_id,
    fecha,
    observaciones = null,
    estado_pedido_id = null,
    detalle_pedido,
  } = body ?? {}

  // Validaciones básicas (campos obligatorios según tu modelo)
  if (!cliente_id || typeof cliente_id !== 'number') {
    return NextResponse.json({ error: 'cliente_id inválido' }, { status: 400 })
  }
  if (!Array.isArray(detalle_pedido) || detalle_pedido.length === 0) {
    return NextResponse.json({ error: 'detalle_pedido debe contener al menos un item' }, { status: 400 })
  }

  for (const [i, d] of detalle_pedido.entries()) {
    if (!d.producto_id || typeof d.producto_id !== 'number') {
      return NextResponse.json({ error: `detalle_pedido[${i}].producto_id inválido` }, { status: 400 })
    }
    if (!d.lista_precio_id || typeof d.lista_precio_id !== 'number') {
      return NextResponse.json({ error: `detalle_pedido[${i}].lista_precio_id inválido` }, { status: 400 })
    }
    const precio = Number(d.precio_unitario)
    const cant = Number(d.cantidad)
    if (isNaN(precio) || precio <= 0) {
      return NextResponse.json({ error: `detalle_pedido[${i}].precio_unitario inválido` }, { status: 400 })
    }
    if (isNaN(cant) || cant <= 0) {
      return NextResponse.json({ error: `detalle_pedido[${i}].cantidad inválida` }, { status: 400 })
    }
  }

  try {
    // confirmar existencia del pedido y obtener detalles existentes
    const existingPedido = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { detalle_pedido: true },
    })
    if (!existingPedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const existingDetailIds = existingPedido.detalle_pedido.map(d => d.id)
    const incomingIds = detalle_pedido.filter((d: any) => d.id).map((d: any) => Number(d.id))

    // validar que los ids que vienen correspondan a detalles del pedido
    for (const id of incomingIds) {
      if (!existingDetailIds.includes(id)) {
        return NextResponse.json({ error: `detalle_pedido.id ${id} no pertenece al pedido` }, { status: 400 })
      }
    }

    const idsToDelete = existingDetailIds.filter(id => !incomingIds.includes(id))

    // construir operaciones para la transacción
    const txOps: any[] = []

    // 1) actualizar cabecera del pedido
    const pedidoUpdateData: any = {
      cliente_id: cliente_id,
      observaciones: observaciones ?? null,
      estado_pedido_id: estado_pedido_id ?? null,
    }
    if (fecha) pedidoUpdateData.fecha = new Date(fecha)

    txOps.push(
      prisma.pedido.update({
        where: { id: orderId },
        data: pedidoUpdateData,
      })
    )

    // 2) eliminar detalles removidos
    if (idsToDelete.length > 0) {
      txOps.push(prisma.detalle_pedido.deleteMany({ where: { id: { in: idsToDelete } } }))
    }

    // 3) actualizar existentes y crear nuevos
    for (const d of detalle_pedido) {
      // calcular subtotal (guardado como string para Decimal)
      const subtotal = (Number(d.cantidad) * Number(d.precio_unitario))
      const subtotalStr = Number.isFinite(subtotal) ? subtotal.toFixed(2) : null

      if (d.id) {
        txOps.push(
          prisma.detalle_pedido.update({
            where: { id: Number(d.id) },
            data: {
              producto_id: Number(d.producto_id),
              cantidad: String(d.cantidad),
              lista_precio_id: Number(d.lista_precio_id),
              precio_unitario: String(d.precio_unitario),
              subtotal: subtotalStr ?? null,
            },
          })
        )
      } else {
        txOps.push(
          prisma.detalle_pedido.create({
            data: {
              pedido_id: orderId,
              producto_id: Number(d.producto_id),
              cantidad: String(d.cantidad),
              lista_precio_id: Number(d.lista_precio_id),
              precio_unitario: String(d.precio_unitario),
              subtotal: subtotalStr ?? null,
            },
          })
        )
      }
    }

    // ejecutar transacción
    await prisma.$transaction(txOps)

    // devolver version actualizada opcional
    const updated = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { detalle_pedido: true, estado_pedido: true },
    })

    return NextResponse.json({ ok: true, pedido: updated })
  } catch (e) {
    console.error('POST /api/orders/[id] error:', e)
    return NextResponse.json({ error: 'Error guardando el pedido' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10)
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { remito: true },
    })
    if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    if (pedido.remito) {
      // No permitimos borrar pedidos que ya tienen remito (para evitar inconsistencias)
      return NextResponse.json(
        { error: 'No se puede eliminar el pedido porque tiene un remito asociado' },
        { status: 400 }
      )
    }

    await prisma.pedido.delete({ where: { id: orderId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/orders/[id] error:', e)
    return NextResponse.json({ error: 'Error al eliminar el pedido' }, { status: 500 })
  }
}

