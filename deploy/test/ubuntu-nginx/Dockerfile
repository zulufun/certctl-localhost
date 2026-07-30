FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    iproute2 \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

RUN echo "server { listen 80; location /health { return 200 'OK'; } }" > /etc/nginx/sites-available/default && \
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

CMD ["nginx", "-g", "daemon off;"]
