import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id, 10);
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        cliente: true,
        detalle_pedido: {
          include: { producto: true },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Transformamos a la forma que usa la UI
    const orderPrint = {
      id: pedido.id.toString(),
      date: pedido.fecha.toLocaleDateString("es-ES"),
      client: {
        name: pedido.cliente.nombre_completo,
        address: pedido.cliente.direccion_completa,
      },
      items: pedido.detalle_pedido.map((d) => ({
        name: d.producto.nombre,
        quantity: Number(d.cantidad),
        price: Number(d.precio_unitario),
        subtotal:
          d.subtotal !== null && d.subtotal !== undefined
            ? Number(d.subtotal)
            : Number(d.cantidad) * Number(d.precio_unitario),
      })),
      total: pedido.detalle_pedido.reduce(
        (sum, d) =>
          sum +
          (d.subtotal !== null && d.subtotal !== undefined
            ? Number(d.subtotal)
            : Number(d.cantidad) * Number(d.precio_unitario)),
        0
      ),
    };

    return NextResponse.json(orderPrint);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
