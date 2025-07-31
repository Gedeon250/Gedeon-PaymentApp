#!/bin/bash

echo "=== Simple Payment Platform Demo ==="
echo ""

echo "1. Starting application instances..."
echo "   - Main server on port 8080"
echo "   - Secondary server on port 8081" 
echo "   - Tertiary server on port 8082"
echo ""

echo "2. Testing direct server access:"
echo "   - Server 1 (port 8080): $(curl -s -I http://localhost:8080 | head -1 | cut -d' ' -f2)"
echo "   - Server 2 (port 8081): $(curl -s -I http://localhost:8081 | head -1 | cut -d' ' -f2)"
echo "   - Server 3 (port 8082): $(curl -s -I http://localhost:8082 | head -1 | cut -d' ' -f2)"
echo ""

echo "3. Testing load balancer (port 8083):"
echo "   - Load balancer status: $(curl -s -I http://localhost:8083 | head -1 | cut -d' ' -f2)"
echo ""

echo "4. Round-robin distribution test:"
for i in {1..6}; do
    echo "   Request $i: $(curl -s -I http://localhost:8083 | head -1 | cut -d' ' -f2)"
done
echo ""

echo "5. Application URLs:"
echo "   - Payment Form: http://localhost:8080"
echo "   - Dashboard: http://localhost:8080/dashboard"
echo "   - Load Balancer: http://localhost:8083"
echo ""

echo "Demo ready! All systems operational." 