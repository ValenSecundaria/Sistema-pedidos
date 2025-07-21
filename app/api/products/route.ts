import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  try {
    const total = await prisma.producto.count()
    const totalPages = Math.ceil(total / limit)

    const productos = await prisma.producto.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categoria_producto: { select: { nombre: true } },
      },
      orderBy: { id: "asc" },
    })

    const formatted = productos.map((p) => ({
      id: p.id.toString(),
      name: p.nombre,
      description: p.descripcion ?? "",
      category: p.categoria_producto?.nombre ?? "",
      priceNormal: Number(p.precio_unitario),
    }))

    return NextResponse.json({
      productos: formatted,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const {
      nombre,
      descripcion,
      unidad_medida,
      categoria_id,
      stock,
      precio_unitario,
    } = await req.json()

    const created = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        unidad_medida: unidad_medida || null,
        categoria_id: categoria_id || null,
        stock: stock != null ? parseFloat(stock) : null,
        precio_unitario: parseFloat(precio_unitario),
      },
    })

    return NextResponse.json(
      {
        id: created.id.toString(),
        name: created.nombre,
        description: created.descripcion ?? "",
        category: "",    
        priceNormal: Number(created.precio_unitario),
        pricePremium: 0,
        saleType: "",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json(
      { error: "Error interno al crear producto" },
      { status: 500 }
    )
  }
}
