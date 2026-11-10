# AlgoLearn Production Multi-Language Runtime Container
FROM node:20-bookworm-slim

# Install compilers/runtimes/debuggers needed for CodeLab Live Debugger & Automated Coding Judge
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python-is-python3 \
    gcc \
    g++ \
    gdb \
    default-jdk-headless \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install root & backend Node dependencies cleanly
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/
RUN npm install --omit=dev && cd backend && npm install --omit=dev

# Copy application source
COPY backend ./backend
COPY frontend ./frontend
COPY database ./database
COPY tests ./tests

# Precompile Java JDI tracer for live step-by-step debugging in host-fallback mode
RUN javac -g backend/debugger/adapters/JavaTracer.java

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD sh -c 'curl -fsS "http://127.0.0.1:${PORT:-3000}/api/ai/status" || exit 1'

CMD ["node", "backend/server.js"]

