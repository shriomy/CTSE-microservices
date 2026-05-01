import codecs

try:
    with codecs.open('docker-compose.yml', 'r', 'utf-16le') as f:
        content = f.read()
except UnicodeError:
    with codecs.open('docker-compose.yml', 'r', 'utf-8') as f:
        content = f.read()

insert_str = """
  cart-service:
    build:
      context: ./cart-service
    container_name: cart-service
    ports:
      - "8084:8084"
    depends_on:
      - kafka
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://ep-floral-moon-a8tr26xb-pooler.eastus2.azure.neon.tech:5432/neondb?sslmode=require
      - SPRING_DATASOURCE_USERNAME=neondb_owner
      - SPRING_DATASOURCE_PASSWORD=npg_rlfTgxVIa4j6
      - SPRING_DATASOURCE_DRIVER-CLASS-NAME=org.postgresql.Driver
      - SERVER_PORT=8084
      - MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info
    networks:
      - microservices-network
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:8084/actuator/health" ]
      interval: 30s
      timeout: 10s
      retries: 5
"""

content = content.replace('  api-gateway:', insert_str + '\n  api-gateway:')
content = content.replace('      - product-service', '      - product-service\n      - cart-service')

try:
    with codecs.open('docker-compose.yml', 'w', 'utf-16le') as f:
        f.write(content)
except Exception:
    with codecs.open('docker-compose.yml', 'w', 'utf-8') as f:
        f.write(content)
