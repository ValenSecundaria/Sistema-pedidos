export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma" // Ajusta el path según tu estructura

export const GET = async () => {
  try {
    const listas = await prisma.lista_precio.findMany({
      select: {
        id: true,
        nombre: true,
      },
    })

    return NextResponse.json(listas)
  } catch (error) {
    console.error("Error al obtener las listas de precio:", error)
    return new NextResponse(
      JSON.stringify({ error: "Error al obtener las listas de precio" }),
      { status: 500 }
    )
  }
}
