# Sistema de Gestión de Pedidos y Clientes

Este proyecto es una aplicación web integral diseñada para optimizar la gestión comercial de un negocio. Permite administrar eficientemente pedidos, clientes, productos y listas de precios, ofreciendo una interfaz moderna y responsiva adaptada tanto para dispositivos móviles como de escritorio.

## 📋 Descripción General

El sistema actúa como un centro de control para las operaciones diarias, facilitando la toma de pedidos y el seguimiento de clientes. Está construido con tecnologías modernas para asegurar rapidez, escalabilidad y una excelente experiencia de usuario. Su arquitectura soporta múltiples listas de precios y tipos de clientes, lo que lo hace flexible para diferentes modelos de negocio.

## 🚀 Características Principales

### 🛒 Gestión de Pedidos
- **Creación de Pedidos:** Interfaz intuitiva para generar nuevos pedidos rápidamente.
- **Seguimiento:** Visualización de pedidos del día y gestión de estados (pendientes, completados, etc.).
- **Detalles:** Manejo de líneas de pedido con cálculos automáticos de subtotales y totales.
- **Remitos:** Generación de remitos asociados a los pedidos.

### 📦 Gestión de Productos
- **Catálogo:** Administración completa de productos (alta, baja, modificación).
- **Categorización:** Organización de productos por categorías.
- **Precios Dinámicos:** Soporte para múltiples listas de precios y precios diferenciados por tipo de cliente.
- **Control de Stock:** Monitoreo de existencias.

### 👥 Gestión de Clientes
- **Base de Datos:** Registro detallado de clientes con información de contacto y ubicación.
- **Segmentación:** Clasificación de clientes por tipos para aplicar estrategias de precios específicas.
- **Historial:** Visualización de la frecuencia de compra y pedidos anteriores.

### 💻 Experiencia de Usuario (UX/UI)
- **Diseño Responsivo:** Interfaz adaptada a móviles (PWA) y escritorio.
- **Dashboard:** Panel principal con accesos directos a las funciones más utilizadas.
- **Feedback Visual:** Uso de notificaciones y estados visuales claros.

## 🛠️ Tecnologías Utilizadas

El proyecto está construido sobre un stack tecnológico robusto y moderno:

- **Frontend / Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Estilos & UI:** 
  - [Chakra UI](https://chakra-ui.com/) (Componentes y diseño)
  - [Emotion](https://emotion.sh/) (CSS-in-JS)
  - [Framer Motion](https://www.framer.com/motion/) (Animaciones)
- **Autenticación:** [NextAuth.js](https://next-auth.js.org/)
- **Manejo de Fechas:** [Luxon](https://moment.github.io/luxon/)
- **PWA:** Soporte para Progressive Web App con `next-pwa`.

## ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd sistema-pedidos
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y configura la conexión a tu base de datos PostgreSQL y otras variables necesarias (ver `.env.example` si existe o basarse en `schema.prisma`).
    ```env
    DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"
    ```

4.  **Inicializar la base de datos:**
    Ejecuta las migraciones de Prisma para crear las tablas.
    ```bash
    npx prisma migrate dev
    ```

5.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

6.  **Acceder a la aplicación:**
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📂 Estructura del Proyecto

- `/app`: Contiene las páginas y rutas de la aplicación (Next.js App Router).
  - `/api`: Endpoints de la API backend.
  - `/orders`, `/products`, `/clients`: Módulos principales de la UI.
- `/components`: Componentes reutilizables de React.
- `/prisma`: Esquema de la base de datos y migraciones.
- `/public`: Archivos estáticos.
- `/lib` / `/utils`: Funciones de utilidad y configuraciones compartidas.

## 📄 Licencia

Este proyecto es de uso privado/interno.
