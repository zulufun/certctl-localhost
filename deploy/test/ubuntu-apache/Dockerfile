FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apache2 \
    curl \
    iproute2 \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

RUN echo "<VirtualHost *:80>\n  Alias /health /var/www/html/index.html\n</VirtualHost>" > /etc/apache2/sites-available/health.conf && \
    a2ensite health && a2enmod ssl && echo "OK" > /var/www/html/index.html

CMD ["apache2ctl", "-D", "FOREGROUND"]
