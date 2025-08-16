"use client";

import { useEffect, useState } from "react";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

// Tipos de la orden
interface OrderItemPrint {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ClientPrint {
  name: string;
  address: string;
}

interface OrderPrint {
  id: string;
  client: ClientPrint;
  items: OrderItemPrint[];
  total: number;
  date: string;
}

// params puede ser síncrono o promesa en Next.js
type MaybePromiseParams = { id: string } | Promise<{ id: string }>;

// Type guard para detectar promesa
function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as Promise<T>).then === "function"
  );
}

export default function PrintOrderPage({ params }: { params: MaybePromiseParams }) {
  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderPrint | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Resolver params sin usar `any`
  useEffect(() => {
    let mounted = true;
    const resolveParams = async () => {
      if (isPromise<{ id: string }>(params)) {
        const resolved = await params;
        if (mounted) setId(resolved.id);
      } else {
        setId(params.id);
      }
    };
    resolveParams();
    return () => {
      mounted = false;
    };
  }, [params]);

  // Fetch de la orden
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}/print`);
      if (res.ok) {
        const data: OrderPrint = await res.json();
        setOrder(data);
      } else {
        console.error("Pedido no encontrado");
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!order) {
    return (
      <Center py={20}>
        <Text fontSize="xl" color="red.500">
          No se encontró el pedido
        </Text>
        <Button mt={4} onClick={() => router.back()}>
          Volver
        </Button>
      </Center>
    );
  }

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
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Producto</Th>
                  <Th isNumeric>Cantidad</Th>
                  <Th isNumeric>Precio Unit.</Th>
                  <Th isNumeric>Subtotal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {order.items.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{item.name}</Td>
                    <Td isNumeric>{item.quantity}</Td>
                    <Td isNumeric>${item.price.toFixed(2)}</Td>
                    <Td isNumeric>${item.subtotal.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>

        <Divider />

        {/* Total */}
        <HStack justify="flex-end">
          <Text fontSize="2xl" fontWeight="bold">
            TOTAL GENERAL: ${order.total.toFixed(2)}
          </Text>
        </HStack>

        {/* Print Button */}
        <Box className="no-print" mt={8}>
          <Button onClick={handlePrint} size="lg" w="full" colorScheme="green">
            Imprimir Remito
          </Button>
        </Box>
      </VStack>

      {/* Estilos impresión */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>
    </Box>
  );
}
