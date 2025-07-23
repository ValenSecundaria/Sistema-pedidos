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
