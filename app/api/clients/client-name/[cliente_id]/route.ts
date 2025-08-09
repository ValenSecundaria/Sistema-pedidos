export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Client } from '@/app/types';


const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { cliente_id: string } }
) {
  const clientId = params.cliente_id;

  try {
    const client = await prisma.cliente.findUnique({
      where: { id: Number(clientId) },
      select: { id: true, nombre_completo: true }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const result: Pick<Client, 'id' | 'name'> = {
      id: client.id.toString(),
      name: client.nombre_completo
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching client name:', error);
    return NextResponse.json(
      { error: 'Error fetching client name' },
      { status: 500 }
    );
  }
}
