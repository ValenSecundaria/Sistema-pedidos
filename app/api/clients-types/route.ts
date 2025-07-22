// /app/api/client-types/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tipos = await prisma.tipo_cliente.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    })

    return NextResponse.json(tipos)
  } catch (error) {
    console.error("Error al obtener tipos de cliente:", error)
    return NextResponse.json({ error: "Error al obtener tipos de cliente" }, { status: 500 })
  }
}
