FROM alpine:latest

# Install compilers, interpreters, and debuggers for all 5 supported languages
RUN apk update && apk add --no-cache \
    python3 \
    nodejs \
    npm \
    gcc \
    g++ \
    musl-dev \
    gdb \
    openjdk17-jdk \
    bash

WORKDIR /debugger

# Install npm packages for Babel AST processing
COPY package.json /debugger/
RUN cd /debugger && npm install --omit=dev

# Copy debugger adapters and entrypoint
COPY adapters /debugger/adapters
COPY entrypoint.sh /debugger/entrypoint.sh
RUN chmod +x /debugger/entrypoint.sh && \
    javac -g /debugger/adapters/JavaTracer.java

WORKDIR /workspace

ENTRYPOINT ["/bin/sh", "/debugger/entrypoint.sh"]

