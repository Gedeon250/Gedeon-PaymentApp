# Simple Payment Platform Dockerfile
FROM python:3.9-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY index.html .
COPY dashboard.html .
COPY style.css .
COPY payment.js .
COPY README.md .

# Expose port 8080
EXPOSE 8080

# Start simple HTTP server
CMD ["python3", "-m", "http.server", "8080"]
