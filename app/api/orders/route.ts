export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type IncomingOrderItem = {
  productId: string
  quantity: number
  // opcional: si el frontend envía precio por ítem (custom o calculado previamente)
  unitPrice?: number | null
  saleType?: string | null
}

type IncomingOrderBody = {
  clientId: string
  items: IncomingOrderItem[]
  subtotalItems?: number[] // opcional, era lo que usabas antes
  total?: number
  dateCreated?: string // ISO string opcional
}

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        detalle_pedido: true,
        estado_pedido: true,
      },
      orderBy: { fecha: 'desc' },
    })

    const orders = pedidos.map((p) => ({
      id: p.id.toString(),
      clientId: p.cliente_id.toString(),
      dateCreated: p.fecha.toISOString(),
      total: p.detalle_pedido.reduce(
        (sum: number, d: any) => sum + Number(d.cantidad) * Number(d.precio_unitario),
        0
      ),
      estadoPedidoId: p.estado_pedido?.id ?? 1,
      estadoPedidoName: p.estado_pedido?.nombre ?? 'Pendiente',
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return NextResponse.error()
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingOrderBody

    const { clientId, items, subtotalItems, dateCreated } = body

    // Validaciones básicas
    if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
      return new NextResponse('Datos incompletos', { status: 400 })
    }

    const clienteIdNum = Number(clientId)
    if (!Number.isFinite(clienteIdNum) || clienteIdNum <= 0) {
      return new NextResponse('clientId inválido', { status: 400 })
    }

    // Validar fecha si viene (si es invalida la omitimos para que prisma use default(now()))
    let fechaToUse: Date | undefined = undefined
    if (typeof dateCreated === 'string' && dateCreated.trim() !== '') {
      const parsed = new Date(dateCreated)
      if (!isNaN(parsed.getTime())) {
        fechaToUse = parsed
      } else {
        // fecha inválida -> omitimos para que prisma use now() por defecto
        console.warn('Fecha inválida recibida en body.dateCreated, se usará now() por defecto.')
      }
    }

    // Crear pedido y detalles en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          cliente_id: clienteIdNum,
          ...(fechaToUse ? { fecha: fechaToUse } : {}), // incluimos fecha sólo si es válida
          estado_pedido_id: 1,
        },
      })

      // Preparamos operaciones para detalle_pedido
      const detalleCreates = [] as Promise<any>[]

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        // validaciones de item
        const prodIdNum = Number(item.productId)
        const qty = Number(item.quantity)
        if (!Number.isFinite(prodIdNum) || prodIdNum <= 0) {
          console.warn(`productId inválido en item index ${i}, se saltea.`)
          continue
        }
        if (!Number.isFinite(qty) || qty <= 0) {
          console.warn(`quantity inválida en item index ${i}, se saltea.`)
          continue
        }

        // Buscar producto para obtener precio base si hace falta
        const producto = await tx.producto.findUnique({ where: { id: prodIdNum } })
        if (!producto) {
          console.warn(`Producto ${prodIdNum} no encontrado, se saltea item index ${i}.`)
          continue
        }

        // Determinar precio unitario con prioridad:
        // 1) item.unitPrice si viene y es válido
        // 2) subtotalItems[i] / qty si subtotalItems está presente y válido
        // 3) producto.precio_unitario (valor base en DB)
        let precioUnitario: number
        if (item.unitPrice != null && Number.isFinite(Number(item.unitPrice)) && Number(item.unitPrice) >= 0) {
          precioUnitario = Number(item.unitPrice)
        } else if (Array.isArray(subtotalItems) && subtotalItems[i] != null && Number.isFinite(Number(subtotalItems[i]))) {
          const maybeSubtotal = Number(subtotalItems[i])
          precioUnitario = qty > 0 ? maybeSubtotal / qty : Number(producto.precio_unitario)
        } else {
          precioUnitario = Number(producto.precio_unitario)
        }

        // Aseguramos precio no NaN
        if (!Number.isFinite(precioUnitario) || isNaN(precioUnitario)) {
          precioUnitario = Number(producto.precio_unitario)
        }

        // lista_precio_id por ahora lo dejamos en 1 (o podrías mapear item.saleType => id)
        const listaPrecioId = 1

        detalleCreates.push(
          tx.detalle_pedido.create({
            data: {
              pedido_id: nuevoPedido.id,
              producto_id: producto.id,
              cantidad: qty,
              precio_unitario: precioUnitario,
              lista_precio_id: listaPrecioId,
            },
          })
        )
      }

      // Ejecutamos todas las creaciones de detalle (si hay)
      if (detalleCreates.length > 0) {
        await Promise.all(detalleCreates)
      }

      return { pedidoId: nuevoPedido.id }
    })

    return NextResponse.json({ mensaje: 'Pedido guardado', pedidoId: result.pedidoId }, { status: 201 })
  } catch (err: unknown) {
    console.error('Error al guardar el pedido:', err)
    // Si querés, podés detectar errores de prisma y devolver códigos más específicos
    return new NextResponse('Error del servidor', { status: 500 })
  }
}
