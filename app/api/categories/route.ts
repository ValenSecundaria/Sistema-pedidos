export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const categorias = await prisma.categoria_producto.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: "asc",
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
