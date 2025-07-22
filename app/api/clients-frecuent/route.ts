import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Obtener todos los IDs de los clientes
    const allIds = await prisma.cliente.findMany({ select: { id: true } })

    // Mezclar los IDs aleatoriamente
    const shuffledIds = allIds.sort(() => 0.5 - Math.random())

    // Tomar los primeros 10 IDs
    const randomIds = shuffledIds.slice(0, 10).map(item => item.id)

    // Obtener los detalles de los 10 clientes aleatorios
    const clients = await prisma.cliente.findMany({
      where: { id: { in: randomIds } },
      select: {
        id: true,
        nombre_completo: true,
        tipo_cliente: { select: { nombre: true } },
      },
      orderBy: { nombre_completo: "asc" }, // Opcional: ordenar por nombre
    })

    // Mapear los datos al formato esperado por el frontend
    const payload = clients.map((c) => ({
      id: c.id.toString(),
      name: c.nombre_completo,
      type: c.tipo_cliente.nombre.toLowerCase() === "premium" ? "Premium" : "Normal",
    }))

    return NextResponse.json({ clients: payload })
  } catch (error) {
    console.error("Error fetching random clients:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}