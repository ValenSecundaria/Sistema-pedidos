-- CreateTable
CREATE TABLE "categoria_producto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "categoria_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "tipo_cliente_id" INTEGER NOT NULL,
    "numero_celular" VARCHAR(20) NOT NULL,
    "direccion_completa" TEXT NOT NULL,
    "nombre_negocio" VARCHAR(100),
    "barrio" VARCHAR(100),
    "frecuencia" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "lista_precio_id" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2),

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_pedido" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "estado_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_precio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "lista_precio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "estado_pedido_id" INTEGER,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precio_producto" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "tipo_cliente_id" INTEGER NOT NULL,
    "lista_precio_id" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "precio_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" VARCHAR(20),
    "categoria_id" INTEGER,
    "stock" DECIMAL(10,2),
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remito" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "fecha_emision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,

    CONSTRAINT "remito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_cliente" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "tipo_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_producto_nombre_key" ON "categoria_producto"("nombre");

-- CreateIndex
CREATE INDEX "idx_cliente_tipo" ON "cliente"("tipo_cliente_id");

-- CreateIndex
CREATE INDEX "idx_detalle_pedido_pedid" ON "detalle_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "idx_detalle_pedido_producto" ON "detalle_pedido"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "estado_pedido_nombre_key" ON "estado_pedido"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "lista_precio_nombre_key" ON "lista_precio"("nombre");

-- CreateIndex
CREATE INDEX "idx_pedido_cliente" ON "pedido"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "precio_producto_producto_id_tipo_cliente_id_lista_precio_id_key" ON "precio_producto"("producto_id", "tipo_cliente_id", "lista_precio_id");

-- CreateIndex
CREATE INDEX "idx_producto_categoria" ON "producto"("categoria_id");

-- CreateIndex
CREATE INDEX "idx_producto_precio_unitario" ON "producto"("precio_unitario");

-- CreateIndex
CREATE UNIQUE INDEX "remito_pedido_id_key" ON "remito"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_cliente_nombre_key" ON "tipo_cliente"("nombre");

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_tipo_cliente_id_fkey" FOREIGN KEY ("tipo_cliente_id") REFERENCES "tipo_cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_lista_precio_id_fkey" FOREIGN KEY ("lista_precio_id") REFERENCES "lista_precio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_estado_pedido_id_fkey" FOREIGN KEY ("estado_pedido_id") REFERENCES "estado_pedido"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "precio_producto" ADD CONSTRAINT "precio_producto_lista_precio_id_fkey" FOREIGN KEY ("lista_precio_id") REFERENCES "lista_precio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "precio_producto" ADD CONSTRAINT "precio_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "precio_producto" ADD CONSTRAINT "precio_producto_tipo_cliente_id_fkey" FOREIGN KEY ("tipo_cliente_id") REFERENCES "tipo_cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_producto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remito" ADD CONSTRAINT "remito_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
