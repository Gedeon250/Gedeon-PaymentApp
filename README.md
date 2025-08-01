# Simple Payment Platform

A containerized payment application using Flutterwave API with SQLite database tracking, deployed with Docker and HAProxy load balancing.

## Quick Start

### Access the Application
- **Load Balanced**: http://localhost:8082
- **Direct Access**: http://localhost:3000
- **Dashboard**: http://localhost:8082/dashboard

## Docker Image Details

### Docker Hub Repository
- **Repository**: `gedeon250/payment-app`
- **Image Name**: `gedeon250/payment-app:v1`
- **Docker Hub URL**: https://hub.docker.com/r/gedeon250/payment-app
- **Tags Available**: `v1`, `latest`

### Pull the Image
```bash
docker pull gedeon250/payment-app:v1
```

## Build Instructions

### Prerequisites
- Docker installed
- Node.js 18+ (for local development)

### Build the Docker Image Locally
```bash
# Clone the repository
git clone <repository-url>
cd Gedeon-PaymentApp

# Build the Docker image
docker build -t gedeon250/payment-app:v1 .

# Verify the build
docker images | grep payment-app
```

### Test the Image Locally
```bash
# Run the container locally
docker run -p 8080:8080 gedeon250/payment-app:v1

# Test the application
curl http://localhost:8080
```

## Deployment Instructions

### Lab Environment Setup

#### 1. Start the Lab Infrastructure
```bash
# Navigate to the lab directory
cd web_infra_lab

# Start the lab containers
docker compose up -d --build

# Verify containers are running
docker ps
```

Expected containers:
- `lb-01` (Load Balancer) - Port 8082
- `web-01` (Web Server 1) - Port 2211 (SSH)
- `web-02` (Web Server 2) - Port 2212 (SSH)

#### 2. Deploy on Web01 and Web02

**Deploy on Web01:**
```bash
# SSH into web-01
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2211

# Install Docker (if not already installed)
apt update && apt install -y docker.io

# Start Docker daemon
dockerd &

# Pull and run the payment app
docker pull gedeon250/payment-app:v1
docker run -d --name app --restart unless-stopped \
  -p 8080:8080 \
  --network web_infra_lab_lablan \
  gedeon250/payment-app:v1
```

**Deploy on Web02:**
```bash
# SSH into web-02
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2212

# Install Docker (if not already installed)
apt update && apt install -y docker.io

# Start Docker daemon
dockerd &

# Pull and run the payment app
docker pull gedeon250/payment-app:v1
docker run -d --name app --restart unless-stopped \
  -p 8080:8080 \
  --network web_infra_lab_lablan \
  gedeon250/payment-app:v1
```

#### 3. Configure Load Balancer (Lb01)

**SSH into lb-01:**
```bash
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2210
```

**Install HAProxy:**
```bash
apt update && apt install -y haproxy
```

**Create HAProxy Configuration:**
```bash
cat > /etc/haproxy/haproxy.cfg << 'EOF'
global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s

frontend http-in
    bind *:80
    default_backend webapps

backend webapps
    balance roundrobin
    server web01 172.20.0.2:8080 check
    server web02 172.20.0.3:8080 check
    http-response set-header X-Served-By %[srv_name]
EOF
```

**Start HAProxy:**
```bash
# Test configuration
haproxy -f /etc/haproxy/haproxy.cfg -c

# Start HAProxy in background
nohup haproxy -f /etc/haproxy/haproxy.cfg > /dev/null 2>&1 &

# Verify HAProxy is running
ps aux | grep haproxy | grep -v grep
```

## Testing and Verification

### 1. Test Individual Containers
```bash
# Test Web01
curl -s -o /dev/null -w "Web01 Status: %{http_code}\n" http://localhost:8080

# Test Web02
curl -s -o /dev/null -w "Web02 Status: %{http_code}\n" http://localhost:8081
```

### 2. Test Load Balancer
```bash
# Test load balancer
curl -s -o /dev/null -w "Load Balancer Status: %{http_code}\n" http://localhost:8082

# Test round-robin distribution
for i in {1..10}; do
    echo "Request $i: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082)"
done
```

### 3. Verify Round-Robin Load Balancing
```bash
# Check response headers for server identification
for i in {1..6}; do
    echo "Request $i:"
    curl -s -I http://localhost:8082 | grep -E "(X-Served-By|HTTP)"
    echo
done
```

### 4. Application Functionality Test
```bash
# Test main application
curl -s http://localhost:8082 | grep -i "payment platform"

# Test dashboard
curl -s http://localhost:8082/dashboard | grep -i "dashboard"
```

## Environment Variables and Configuration

### Application Environment Variables
- `PORT`: Application port (default: 8080)
- `NODE_ENV`: Environment mode (development/production)

### Docker Run with Environment Variables
```bash
docker run -d --name app \
  -p 8080:8080 \
  -e PORT=8080 \
  -e NODE_ENV=production \
  gedeon250/payment-app:v1
```

## Security Hardening (Optional)

### Handle API Keys Securely
Instead of baking API keys into the image, use environment variables:

```bash
# Create a .env file for secrets
cat > .env << EOF
FLUTTERWAVE_SECRET_KEY=your_secret_key_here
FLUTTERWAVE_PUBLIC_KEY=your_public_key_here
DATABASE_PATH=/app/payments.db
EOF

# Run container with secrets
docker run -d --name app \
  -p 8080:8080 \
  --env-file .env \
  gedeon250/payment-app:v1
```

### Docker Secrets (Production)
```bash
# Create Docker secret
echo "your_secret_key" | docker secret create flutterwave_secret_key -

# Run with secrets
docker run -d --name app \
  -p 8080:8080 \
  --secret flutterwave_secret_key \
  gedeon250/payment-app:v1
```

## Monitoring and Health Checks

### Container Health Status
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check container logs
docker logs web01-app
docker logs web02-app
```

### HAProxy Statistics
```bash
# SSH into lb-01 and check HAProxy stats
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2210
haproxy -f /etc/haproxy/haproxy.cfg -c
```

## Acceptance Criteria Verification

### Application runs correctly in both containers
```bash
# Verify both containers are running and healthy
docker ps | grep payment-app
```

### HAProxy successfully routes requests to both instances
```bash
# Test load balancer distribution
for i in {1..10}; do
    curl -s http://localhost:8082 > /dev/null
    echo "Request $i completed"
done
```

### Docker image is publicly available and reproducible
```bash
# Pull and run the image from Docker Hub
docker pull gedeon250/payment-app:v1
docker run -p 8080:8080 gedeon250/payment-app:v1
```

## Production Deployment Script

Create a deployment script for easy reproduction:

```bash
#!/bin/bash
# deploy.sh

echo "Deploying Payment Platform..."

# Build and push image
docker build -t gedeon250/payment-app:v1 .
docker push gedeon250/payment-app:v1

# Start lab infrastructure
cd web_infra_lab
docker compose up -d

# Deploy on web servers
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2211 "docker pull gedeon250/payment-app:v1 && docker run -d --name app --restart unless-stopped -p 8080:8080 --network web_infra_lab_lablan gedeon250/payment-app:v1"
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2212 "docker pull gedeon250/payment-app:v1 && docker run -d --name app --restart unless-stopped -p 8080:8080 --network web_infra_lab_lablan gedeon250/payment-app:v1"

# Configure and start HAProxy
sshpass -p 'pass123' scp -P 2210 -o StrictHostKeyChecking=no haproxy.cfg root@localhost:/etc/haproxy/haproxy.cfg
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2210 "nohup haproxy -f /etc/haproxy/haproxy.cfg > /dev/null 2>&1 &"

echo "Deployment complete! Access at http://localhost:8082"
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Stop existing containers or use different ports
2. **HAProxy not starting**: Check configuration syntax with `haproxy -c`
3. **Containers not connecting**: Verify network configuration
4. **SSH connection issues**: Remove old host keys with `ssh-keygen -R`

### Logs and Debugging
```bash
# Check container logs
docker logs <container-name>

# Check HAProxy logs
sshpass -p 'pass123' ssh -o StrictHostKeyChecking=no root@localhost -p 2210 "tail -f /var/log/haproxy.log"

# Check network connectivity
docker network inspect web_infra_lab_lablan
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [HAProxy Documentation](https://www.haproxy.org/download/2.4/doc/)
- [Flutterwave API Documentation](https://developer.flutterwave.com/)

---

**Deployment Status**: Complete  
**Last Updated**: August 1, 2024  
**Version**: v1.0.0

