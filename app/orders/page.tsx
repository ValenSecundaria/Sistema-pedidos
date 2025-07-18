"use client"

import { useState, useEffect } from "react"
import { VStack, Button, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, HStack } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { Layout } from "../components/layout"
import { ProtectedRoute } from "../components/ProtectedRoute"
import type { Order } from "../types"

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Cargar pedidos del localStorage para la demo
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    setOrders(savedOrders)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ProtectedRoute>
      <Layout title="Pedidos">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button onClick={() => router.push("/orders/new")} size="lg" colorScheme="green">
              + Nuevo Pedido
            </Button>
          </HStack>

          <TableContainer>
            <Table variant="simple" size="lg">
              <Thead>
                <Tr>
                  <Th fontSize="md">ID</Th>
                  <Th fontSize="md">Cliente</Th>
                  <Th fontSize="md">Fecha</Th>
                  <Th fontSize="md">Total</Th>
                  <Th fontSize="md">Estado</Th>
                  <Th fontSize="md">Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.id}>
                    <Td fontSize="md">#{order.id.slice(-6)}</Td>
                    <Td fontSize="md">Cliente {order.clientId}</Td>
                    <Td fontSize="md">{formatDate(order.dateCreated)}</Td>
                    <Td fontSize="md">${order.total}</Td>
                    <Td>
                      <Badge colorScheme="green">Guardado</Badge>
                    </Td>
                    <Td>
                      <Button size="sm" onClick={() => window.open(`/orders/${order.id}/print`, "_blank")}>
                        Imprimir
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {orders.length === 0 && (
            <VStack spacing={4} py={8}>
              <text>No hay pedidos registrados</text>
              <Button onClick={() => router.push("/orders/new")} size="lg" colorScheme="green">
                Crear Primer Pedido
              </Button>
            </VStack>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
