export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "20")

    if (page < 1 || limit < 1) {
      return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const totalClients = await prisma.cliente.count()

    const clients = await prisma.cliente.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        nombre_completo: true,
        tipo_cliente: { select: { nombre: true } },
        numero_celular: true,
        direccion_completa: true,
        nombre_negocio: true,
        barrio: true,
      },
      orderBy: { nombre_completo: "asc" },
    })

    type ClientFromDb = {
      id: number;
      nombre_completo: string;
      tipo_cliente: { nombre: string };
      numero_celular: string | null;
      direccion_completa: string | null;
      nombre_negocio: string | null;
      barrio: string | null;
    };

    const payload = clients.map((c: ClientFromDb) => ({
      id: c.id.toString(),
      name: c.nombre_completo,
      type: c.tipo_cliente.nombre.toLowerCase() === "premium" ? "Premium" : "Normal",
      phone: c.numero_celular || "-",
      address: c.direccion_completa || "-",
      name_business: c.nombre_negocio || "-",
      neighborhood: c.barrio || "-",
    }))

    const totalPages = Math.ceil(totalClients / limit)

    return NextResponse.json({ clients: payload, page, totalPages })
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
