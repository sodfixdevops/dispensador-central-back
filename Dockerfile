# Usa una imagen base oficial de Node.js
FROM node:20-alpine as builder

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala el CLI de NestJS globalmente
RUN npm install -g @nestjs/cli

# Copia los archivos necesarios para instalar las dependencias
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación
RUN nest build

# Crear una imagen optimizada para producción
FROM node:20-alpine

WORKDIR /app

# Copia los archivos necesarios desde la fase de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# Instala solo las dependencias de producción
RUN npm install --only=production

# Expone el puerto que utiliza tu aplicación
EXPOSE 6001

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
