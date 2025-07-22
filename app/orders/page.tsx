'use client'

import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { Layout } from '../components/layout'
import { ProtectedRoute } from '../components/ProtectedRoute'

type Order = {
  id: string
  clientId: string
  dateCreated: string
  total: number
  estadoPedidoId: number
  estadoPedidoName: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1) carga inicial
  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Error cargando pedidos')
      setOrders(await res.json())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // 2) siguiente estado cíclico 1→2→3→1
  const nextState = (cur: number) => (cur % 3) + 1

  // 3) invocar PATCH a nuestra ruta app/api/orders/[id]
  const changeState = async (o: Order) => {
    const next = nextState(o.estadoPedidoId)
    const res = await fetch(`/api/orders/${o.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stateId: next }),
    })
    if (res.ok) {
      const upd = await res.json() as {
        estadoPedidoId: number
        estadoPedidoName: string
      }
      // actualizar localmente
      setOrders(prev =>
        prev.map(x =>
          x.id === o.id
            ? { ...x, estadoPedidoId: upd.estadoPedidoId, estadoPedidoName: upd.estadoPedidoName }
            : x
        )
      )
    } else {
      console.error('No se pudo cambiar el estado')
    }
  }

  const badgeColor = (id: number) =>
    id === 1 ? 'yellow' : id === 2 ? 'green' : 'red'

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (loading) {
    return (
      <Layout title="Pedidos">
        <Center py={20}>
          <Spinner size="xl" />
        </Center>
      </Layout>
    )
  }
  if (error) {
    return (
      <Layout title="Pedidos">
        <Center py={20}>
          <Text color="red.500">Error: {error}</Text>
        </Center>
      </Layout>
    )
  }

  return (
    <ProtectedRoute>
      <Layout title="Pedidos">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button size="lg" colorScheme="green" onClick={() => router.push('/orders/new')}>
              + Nuevo Pedido
            </Button>
          </HStack>

          <TableContainer>
            <Table variant="simple" size="lg">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map(o => (
                  <Tr key={o.id}>
                    <Td>#{o.id.slice(-6)}</Td>
                    <Td>Cliente {o.clientId}</Td>
                    <Td>{formatDate(o.dateCreated)}</Td>
                    <Td>${o.total.toFixed(2)}</Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme={badgeColor(o.estadoPedidoId)}
                        onClick={() => changeState(o)}
                      >
                        {o.estadoPedidoName}
                      </Button>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          onClick={() => window.open(`/orders/${o.id}/print`, '_blank')}
                        >
                          Imprimir
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {orders.length === 0 && (
            <Center py={10} flexDir="column">
              <Text>No hay pedidos registrados</Text>
              <Button
                mt={4}
                size="lg"
                colorScheme="green"
                onClick={() => router.push('/orders/new')}
              >
                Crear Primer Pedido
              </Button>
            </Center>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
