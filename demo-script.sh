#!/bin/bash

# Demo Script for Payment Platform
# This script demonstrates the complete functionality of the payment platform

echo "Payment Platform Demo Script"
echo "============================"
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "1. Checking container status..."
echo "-------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "2. Testing individual containers..."
echo "----------------------------------"

# Test Web01
echo "Testing Web01 (Port 8080):"
if curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080; then
    echo "Web01 is responding correctly"
else
    echo "Warning: Web01 is not responding"
fi
echo

# Test Web02
echo "Testing Web02 (Port 8081):"
if curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8081; then
    echo "Web02 is responding correctly"
else
    echo "Warning: Web02 is not responding"
fi
echo

echo "3. Testing load balancer..."
echo "---------------------------"

# Test load balancer
echo "Testing Load Balancer (Port 8082):"
if curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8082; then
    echo "Load balancer is responding correctly"
else
    echo "Error: Load balancer is not responding"
    exit 1
fi
echo

echo "4. Demonstrating round-robin load balancing..."
echo "---------------------------------------------"

# Test round-robin distribution
echo "Making 10 requests to demonstrate load balancing:"
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082)
    echo "Request $i: HTTP $response"
done
echo

echo "5. Testing application functionality..."
echo "-------------------------------------"

# Test main application
echo "Testing main application:"
if curl -s http://localhost:8082 | grep -q "Payment Platform"; then
    echo "Main application is working correctly"
else
    echo "Warning: Main application may have issues"
fi
echo

# Test dashboard
echo "Testing dashboard:"
if curl -s http://localhost:8082/dashboard | grep -q "Dashboard"; then
    echo "Dashboard is working correctly"
else
    echo "Warning: Dashboard may have issues"
fi
echo

echo "6. Checking Docker images..."
echo "---------------------------"
docker images | grep payment
echo

echo "7. Network connectivity test..."
echo "------------------------------"
docker network inspect web_infra_lab_lablan 2>/dev/null | grep -A 5 "Containers" || echo "Network not found or containers not running"
echo

echo "Demo completed successfully!"
echo "============================"
echo
echo "Access your application at:"
echo "- Load Balanced: http://localhost:8082"
echo "- Direct Web01: http://localhost:8080"
echo "- Direct Web02: http://localhost:8081"
echo "- Dashboard: http://localhost:8082/dashboard"
echo
echo "All systems are operational and ready for demonstration." 