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
    });

    const orders = pedidos.map((p) => ({
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
  } catch (error) {
    console.log("Error al obtener pedidos:", error);
    return NextResponse.error();
  }
}

