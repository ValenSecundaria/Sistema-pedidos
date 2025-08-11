// /api/products/[id]/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10)

  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const producto = await prisma.producto.findUnique({
      where: { id: productId },
    })

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Retornamos campos que espera el frontend para precargar el formulario
    return NextResponse.json({
      id: producto.id.toString(),
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      unidad_medida: producto.unidad_medida ?? "",
      categoria_id: producto.categoria_id ?? null,
      stock: producto.stock ?? null,
      precio_unitario: Number(producto.precio_unitario),
    })
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id, 10)

  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const {
      nombre,
      descripcion,
      unidad_medida,
      categoria_id,
      stock,
      precio_unitario,
    } = await req.json()

    const updated = await prisma.producto.update({
      where: { id: productId },
      data: {
        nombre,
        descripcion: descripcion || null,
        unidad_medida: unidad_medida || null,
        categoria_id: categoria_id || null,
        stock: stock != null ? parseFloat(stock) : null,
        precio_unitario: parseFloat(precio_unitario),
      },
    })

    return NextResponse.json({
      id: updated.id.toString(),
      nombre: updated.nombre,
      descripcion: updated.descripcion ?? "",
      unidad_medida: updated.unidad_medida ?? "",
      categoria_id: updated.categoria_id ?? null,
      stock: updated.stock ?? null,
      precio_unitario: Number(updated.precio_unitario),
    })
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
