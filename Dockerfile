# ---- ETAPA 1: Compilación de Next.js (Node) ----
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- ETAPA 2: Imagen Final Híbrida (Python + Node) ----
# Utilizamos la base de Python requerida para Xnoppo original
FROM python:3.11-slim AS final

# 1. Instalar dependencias del sistema y Node.js 20 en la base de Python
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Copiar archivos de Next.js compilados
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

# 3. Configuración para Python (Xnoppo)
# Copiaremos los requerimientos de Python. Asume que tienes un requirements.txt
COPY requirements.txt ./
# Instalamos librerías Python si el archivo no está vacío
RUN if [ -s requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Copia de todo el código (incluirá tus scripts de Python de Xnoppo)
COPY . .

# 4. Script de arranque maestro
RUN chmod +x start.sh

# Exponer el puerto de Next.js y el de Python (ajusta el 8000 si usas otro)
EXPOSE 3000
EXPOSE 8000

CMD ["./start.sh"]
