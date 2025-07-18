"use client"

import { useEffect, useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Button,
} from "@chakra-ui/react"

// Definimos interfaces específicas para evitar usar 'any'
interface OrderItemPrint {
  name: string
  quantity: number
  price: number
  subtotal: number
}

interface ClientPrint {
  name: string
  address: string
}

interface OrderPrint {
  id: string
  client: ClientPrint
  items: OrderItemPrint[]
  total: number
  date: string
}

export default function PrintOrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderPrint | null>(null)

  useEffect(() => {
    // En una app real, cargarías el pedido por ID
    // Para la demo, usamos datos mock con el tipo definido
    const mockOrder: OrderPrint = {
      id: params.id,
      client: { name: "Cliente Demo", address: "Dirección Demo" },
      items: [
        { name: "Producto A", quantity: 2, price: 100, subtotal: 200 },
        { name: "Producto B", quantity: 1, price: 150, subtotal: 150 },
      ],
      total: 350,
      date: new Date().toLocaleDateString("es-ES"),
    }
    setOrder(mockOrder)
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  if (!order) return <div>Cargando...</div>

  return (
    <Box p={8} maxW="800px" mx="auto" bg="white" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="brand.700">
              REMITO
            </Heading>
            <Text fontSize="lg">#{order.id}</Text>
            <Text fontSize="md">Fecha: {order.date}</Text>
          </VStack>

          <Box textAlign="right">
            <Heading size="lg">LOGO</Heading>
            <Text fontSize="sm">Sistema de Gestión</Text>
          </Box>
        </HStack>

        <Divider />

        {/* Client Info */}
        <VStack align="start" spacing={2}>
          <Heading size="md">Datos del Cliente</Heading>
          <Text fontSize="lg">
            <strong>Nombre:</strong> {order.client.name}
          </Text>
          <Text fontSize="lg">
            <strong>Dirección:</strong> {order.client.address}
          </Text>
        </VStack>

        <Divider />

        {/* Items Table */}
        <VStack align="start" spacing={4}>
          <Heading size="md">Detalle del Pedido</Heading>

          <TableContainer w="full">
            <Table variant="simple" size="lg">
              <Thead>
                <Tr>
                  <Th fontSize="md" borderColor="gray.400">
                    Producto
                  </Th>
                  <Th fontSize="md" borderColor="gray.400" isNumeric>
                    Cantidad
                  </Th>
                  <Th fontSize="md" borderColor="gray.400" isNumeric>
                    Precio Unit.
                  </Th>
                  <Th fontSize="md" borderColor="gray.400" isNumeric>
                    Subtotal
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {order.items.map((item: OrderItemPrint, index: number) => (
                  <Tr key={index}>
                    <Td fontSize="md" borderColor="gray.300">
                      {item.name}
                    </Td>
                    <Td fontSize="md" borderColor="gray.300" isNumeric>
                      {item.quantity}
                    </Td>
                    <Td fontSize="md" borderColor="gray.300" isNumeric>
                      ${item.price}
                    </Td>
                    <Td fontSize="md" borderColor="gray.300" isNumeric>
                      ${item.subtotal}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>

        <Divider />

        {/* Total */}
        <HStack justify="flex-end">
          <VStack align="end" spacing={2}>
            <Text fontSize="2xl" fontWeight="bold">
              TOTAL GENERAL: ${order.total}
            </Text>
          </VStack>
        </HStack>

        {/* Print Button - Hidden when printing */}
        <Box className="no-print" mt={8}>
          <Button onClick={handlePrint} size="lg" w="full" colorScheme="green">
            Imprimir Remito
          </Button>
        </Box>
      </VStack>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </Box>
  )
}
