#!/bin/bash

echo "Starting Payment Platform Server..."
echo "=================================="

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port 3000..."
echo "Payment page: http://localhost:3000"
echo "Dashboard: http://localhost:3000/dashboard"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
