FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    unzip \
    tar \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/recon/bin /tmp/recon

RUN curl -fsSL https://github.com/projectdiscovery/subfinder/releases/download/v2.16.0/subfinder_2.16.0_linux_amd64.zip -o /tmp/recon/subfinder.zip \
    && unzip -q /tmp/recon/subfinder.zip -d /tmp/recon/subfinder \
    && install -m 0755 /tmp/recon/subfinder/subfinder /opt/recon/bin/subfinder \
    && curl -fsSL https://github.com/owasp-amass/amass/releases/download/v5.1.1/amass_linux_amd64.tar.gz -o /tmp/recon/amass.tar.gz \
    && mkdir -p /tmp/recon/amass \
    && tar -xzf /tmp/recon/amass.tar.gz -C /tmp/recon/amass \
    && install -m 0755 "$(find /tmp/recon/amass -type f -name amass | head -n 1)" /opt/recon/bin/amass \
    && curl -fsSL https://github.com/projectdiscovery/dnsx/releases/download/v1.3.1/dnsx_1.3.1_linux_amd64.zip -o /tmp/recon/dnsx.zip \
    && unzip -q /tmp/recon/dnsx.zip -d /tmp/recon/dnsx \
    && install -m 0755 /tmp/recon/dnsx/dnsx /opt/recon/bin/dnsx \
    && curl -fsSL https://github.com/projectdiscovery/httpx/releases/download/v1.12.0/httpx_1.12.0_linux_amd64.zip -o /tmp/recon/httpx.zip \
    && unzip -q /tmp/recon/httpx.zip -d /tmp/recon/httpx \
    && install -m 0755 /tmp/recon/httpx/httpx /opt/recon/bin/httpx \
    && rm -rf /tmp/recon

WORKDIR /app
COPY . .
RUN npm install -g corepack@latest && corepack pnpm install && corepack pnpm run build

ENV NODE_ENV=production
ENV RECON_TOOL_DIR=/opt/recon/bin
EXPOSE 3000
CMD ["node", "dist/index.js"]
