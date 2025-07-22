// app/orders/diarios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/layout';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import type { Order } from '../../types';

export default function DailyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders/today');
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido');
        }
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <Layout title="Pedidos del Día">
        <p>Cargando pedidos de hoy...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Pedidos del Día">
        <p>Error: {error}</p>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="Pedidos del Día">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button
              onClick={() => router.push('/orders/new')}
              size="lg"
              colorScheme="green"
            >
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
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open(`/orders/${order.id}/print`, '_blank')
                        }
                      >
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
              <span>No hay pedidos registrados hoy</span>
              <Button
                onClick={() => router.push('/orders/new')}
                size="lg"
                colorScheme="green"
              >
                Crear Primer Pedido
              </Button>
            </VStack>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  );
}
