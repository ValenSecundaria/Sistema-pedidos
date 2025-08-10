export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type UpdateClientBody = {
  name?: string
  type?: string | number
  phone?: string
  address?: string
  name_business?: string | null
  neighborhood?: string | null
}

type UpdateClientePayload = {
  nombre_completo: string
  numero_celular: string
  direccion_completa: string
  nombre_negocio: string | null
  barrio: string | null
  tipo_cliente_id?: number
}


export async function GET(request: Request, { params }: { params: { cliente_id: string } }) {
  const clientId = params.cliente_id
  const url = new URL(request.url)
  const onlyClient = url.searchParams.get('onlyClient') === 'true'

  if (onlyClient) {
    // Devuelve datos del cliente (para precarga en el modal)
    try {
      const client = await prisma.cliente.findUnique({
        where: { id: Number(clientId) },
        include: { tipo_cliente: true },
      })
      if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

      return NextResponse.json(
        {
          id: client.id.toString(),
          name: client.nombre_completo,
          typeId: client.tipo_cliente_id,
          typeName: client.tipo_cliente?.nombre ?? null,
          phone: client.numero_celular,
          address: client.direccion_completa,
          name_business: client.nombre_negocio,
          neighborhood: client.barrio,
        },
        { status: 200 }
      )
    } catch (e) {
      console.error('Error fetching client:', e)
      return NextResponse.json({ error: 'Error fetching client' }, { status: 500 })
    }
  }

  // COMPORTAMIENTO ORIGINAL (no lo cambiamos): devuelve pedidos del cliente
  try {
    const orders = await prisma.pedido.findMany({
      where: { cliente_id: Number(clientId) },
      include: {
        detalle_pedido: {
          include: {
            producto: true,
            lista_precio: true,
          },
        },
        estado_pedido: true,
      },
      orderBy: { fecha: 'desc' },
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id.toString(),
      clientId: order.cliente_id.toString(),
      orderNumber: `PED-${order.id.toString().padStart(3, '0')}`,
      dateCreated: order.fecha.toISOString(),
      items: order.detalle_pedido.map((item) => ({
        id: item.id.toString(),
        productId: item.producto_id.toString(),
        productName: item.producto?.nombre ?? 'Producto sin nombre',
        quantity: Number(item.cantidad),
        unitPrice: Number(item.precio_unitario),
        subtotal: item.subtotal ? Number(item.subtotal) : Number(item.precio_unitario) * Number(item.cantidad),
        saleType: item.lista_precio?.nombre ?? 'lista desconocida',
      })),
      total: order.detalle_pedido.reduce((sum, item) => sum + (item.subtotal ? Number(item.subtotal) : Number(item.precio_unitario) * Number(item.cantidad)), 0),
      status: order.estado_pedido?.nombre || 'unknown',
    }))

    return NextResponse.json({ orders: formattedOrders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Error fetching client orders' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { cliente_id: string } }) {
  const clientId = Number(params.cliente_id)
  if (Number.isNaN(clientId)) return NextResponse.json({ error: 'cliente_id inválido' }, { status: 400 })

  let body: UpdateClientBody
  try {
    body = (await request.json()) as UpdateClientBody
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (!body.name || !String(body.name).trim()) return NextResponse.json({ error: "El campo 'name' es obligatorio" }, { status: 400 })
  if (!body.phone || !String(body.phone).trim()) return NextResponse.json({ error: "El campo 'phone' es obligatorio" }, { status: 400 })
  if (!body.address || !String(body.address).trim()) return NextResponse.json({ error: "El campo 'address' es obligatorio" }, { status: 400 })

  try {
    let tipoClienteId: number | undefined = undefined
    if (body.type != null) {
      const maybeNum = typeof body.type === 'number' ? body.type : parseInt(String(body.type), 10)
      if (!Number.isNaN(maybeNum) && maybeNum > 0) {
        const byId = await prisma.tipo_cliente.findUnique({ where: { id: maybeNum } })
        if (byId) tipoClienteId = byId.id
      }
      if (!tipoClienteId) {
        const byName = await prisma.tipo_cliente.findFirst({ where: { nombre: String(body.type) } })
        if (byName) tipoClienteId = byName.id
      }
    }

    const data: UpdateClientePayload = {
      nombre_completo: String(body.name).trim(),
      numero_celular: String(body.phone).trim(),
      direccion_completa: String(body.address).trim(),
      nombre_negocio: body.name_business != null ? String(body.name_business).trim() : null,
      barrio: body.neighborhood != null ? String(body.neighborhood).trim() : null,
    }
    if (tipoClienteId != null) data.tipo_cliente_id = tipoClienteId

    const updated = await prisma.cliente.update({
      where: { id: clientId },
      data,
    })

    return NextResponse.json({
      id: updated.id.toString(),
      name: updated.nombre_completo,
      typeId: updated.tipo_cliente_id,
      phone: updated.numero_celular,
      address: updated.direccion_completa,
      name_business: updated.nombre_negocio,
      neighborhood: updated.barrio,
    }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error updating client:', error)
    // chequeo seguro del código de error (Prisma usa P2025 cuando no encuentra)
    const errAny = error as { code?: string; message?: string }
    if (errAny?.code === 'P2025') return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Error actualizando cliente' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { cliente_id: string } }) {
  const clientId = Number(params.cliente_id)
  if (Number.isNaN(clientId)) return NextResponse.json({ error: 'cliente_id inválido' }, { status: 400 })

  const url = new URL(request.url)
  const cascade = url.searchParams.get('cascade') === 'true'

  try {
    const pedidos = await prisma.pedido.findMany({ where: { cliente_id: clientId }, select: { id: true } })
    const pedidoIds = pedidos.map(p => p.id)

    if (pedidoIds.length > 0 && !cascade) {
      return NextResponse.json({
        error: 'El cliente tiene pedidos asociados. Si desea eliminarlo y todos sus pedidos, vuelva a intentar con ?cascade=true'
      }, { status: 400 })
    }

    if (pedidoIds.length === 0) {
      await prisma.cliente.delete({ where: { id: clientId } })
      return NextResponse.json({ message: 'Cliente eliminado correctamente' }, { status: 200 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.remito.deleteMany({ where: { pedido_id: { in: pedidoIds } } })
      await tx.detalle_pedido.deleteMany({ where: { pedido_id: { in: pedidoIds } } })
      await tx.pedido.deleteMany({ where: { id: { in: pedidoIds } } })
      await tx.cliente.delete({ where: { id: clientId } })
    })

    return NextResponse.json({ message: 'Cliente y pedidos asociados eliminados correctamente' }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error deleting client (cascade):', error)
    const errAny = error as { code?: string; message?: string }
    if (errAny?.code === 'P2025') return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    return NextResponse.json({ error: 'Error eliminando cliente' }, { status: 500 })
  }
}

