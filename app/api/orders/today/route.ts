import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
  // Definir horario de Argentina
  const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');

  const start = now.startOf('day').toJSDate(); // 00:00 hora ARG
  const end = now.endOf('day').toJSDate();     // 23:59:59.999 hora ARG

  const pedidosHoy = await prisma.pedido.findMany({
    where: { fecha: { gte: start, lte: end } },
    include: { cliente: true, detalle_pedido: true, estado_pedido: true },
    orderBy: { fecha: 'asc' },
  });

  const orders = pedidosHoy.map(p => ({
    id: p.id.toString(),
    clientId: p.cliente_id.toString(),
    dateCreated: p.fecha.toISOString(),
    items: p.detalle_pedido.map((d) => ({
      productId: d.producto_id.toString(),
      quantity: Number(d.cantidad),
    })),
    subtotalItems: p.detalle_pedido.map((d) => Number(d.cantidad) * Number(d.precio_unitario)),
    total: p.detalle_pedido.reduce(
      (sum, d) => sum + Number(d.cantidad) * Number(d.precio_unitario),
      0
    ),
  }));

  return NextResponse.json(orders);
}
