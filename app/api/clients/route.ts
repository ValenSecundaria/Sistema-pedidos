export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 


type ClientWithTipo = {
  id: number
  nombre_completo: string
  tipo_cliente: { nombre: string }
}

export async function GET() {
  try {
    const clients: ClientWithTipo[] = await prisma.cliente.findMany({
      select: {
        id: true,
        nombre_completo: true,
        tipo_cliente: { select: { nombre: true } },
      },
    })

    const payload = clients.map((c) => ({
      id: c.id.toString(),
      name: c.nombre_completo,
      type: c.tipo_cliente.nombre.toLowerCase() as "Normal" | "Premium",
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("Cuerpo de la solicitud:")
    console.log("Datos recibidos:", body)

    const {
      name,
      type,
      phone,
      address,
      name_business,
      neighborhood,
    } = body

    // Buscar tipo_cliente_id desde la tabla tipo_cliente
    //console.log("Type recibido:", type);

    //const tipoCliente = await prisma.tipo_cliente.findMany();
    //console.log("Tipos en base:", tipoCliente);

    const tipoCliente = await prisma.tipo_cliente.findFirst({
      where: { nombre: type },
    })

    console.log("Tipo de cliente encontrado:", tipoCliente)

    if (!tipoCliente) {
      return NextResponse.json(
        { error: "Tipo de cliente no válido" },
        { status: 400 }
      )
    }

    const newClient = await prisma.cliente.create({
      data: {
        nombre_completo: name,
        numero_celular: phone,
        direccion_completa: address,
        nombre_negocio: name_business || null,
        barrio: neighborhood || null,
        tipo_cliente: { connect: { id:  tipoCliente.id } },
      },
    })

    // ✅ Formatear respuesta al tipo `Client`
    return NextResponse.json({
      id: newClient.id.toString(),
      name: newClient.nombre_completo,
      type: type as "Normal" | "Premium",
      phone: newClient.numero_celular,
      address: newClient.direccion_completa,
      name_business: newClient.nombre_negocio || undefined,
      neighborhood: newClient.barrio || undefined,
    }, { status: 201 })

  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}
