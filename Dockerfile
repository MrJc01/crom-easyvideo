# ==============================================================================
# Crom EasyVideo — Dockerfile All-in-One (Web Studio + CromyVoice TTS + CLI)
# ==============================================================================
FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=5174

# Instala ferramentas essenciais do SO, certificados e FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    ffmpeg \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instala todas as dependências (incluindo devDependencies para build)
COPY package*.json ./
RUN npm install --include=dev

# Copia todo o código-fonte da aplicação
COPY . .

# Garante permissão de execução para o binário neural CromyVoice
RUN chmod +x bin/cromyvoice

# Constrói o bundle otimizado de produção
RUN npm run build

# Define o ambiente final como produção
ENV NODE_ENV=production

# Expõe a porta padrão do estúdio
EXPOSE 5174

# Healthcheck do container
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5174/ || exit 1

# Inicia o estúdio Web com o endpoint neural TTS integrado
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5174"]
