export const runtime = 'nodejs'

import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const estados = await prisma.estado_pedido.findMany()
    res.status(200).json(estados)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
}
