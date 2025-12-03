# Imagen base
FROM node:18-alpine

# Setea directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos necesarios primero (para aprovechar la cache de npm)
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Genera Prisma Client
RUN npx prisma generate

# Expone el puerto en el que corre tu app
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "dev"]
