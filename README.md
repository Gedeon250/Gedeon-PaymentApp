# Simple Payment Platform - API Integration Project

## Project Overview

This project represents my journey into building a practical payment processing application that integrates with real-world APIs. As a student learning web development and API integration, I wanted to create something that goes beyond a simple demo - a functional payment platform that could actually be used by small businesses.

The application demonstrates my understanding of:
- External API integration (Flutterwave Payment API)
- Full-stack web development (Node.js, Express, HTML/CSS/JavaScript)
- Database management (SQLite)
- Containerization and deployment (Docker)
- Load balancing and scalability (HAProxy)

## Personal Development Journey

### Why I Chose This Project

I selected payment processing as my API integration project because it represents a real-world challenge that many businesses face. Unlike simple entertainment apps, payment processing requires careful attention to security, error handling, and user experience. This project allowed me to work with a professional-grade API while learning about financial technology.

### Challenges I Encountered

1. **Docker-in-Docker Limitations**: The biggest challenge was deploying Docker containers within the lab environment. The nested container setup caused persistent Docker daemon issues, forcing me to develop a hybrid deployment approach.

2. **API Integration Complexity**: Integrating with Flutterwave's API required understanding webhook callbacks, transaction verification, and proper error handling for financial transactions.

3. **Load Balancer Configuration**: Configuring HAProxy to properly distribute traffic between multiple application instances while maintaining session consistency.

4. **Database Design**: Designing a robust database schema to track payment transactions, status updates, and provide meaningful analytics.

### How I Overcame These Challenges

- **Hybrid Deployment**: Instead of giving up on Docker requirements, I built and pushed the Docker image to meet the assignment criteria, then deployed the application directly using Node.js on the lab containers.

- **API Documentation Study**: I spent significant time reading Flutterwave's documentation, understanding their test environment, and implementing proper error handling.

- **Iterative Testing**: I tested the load balancer configuration extensively, using curl commands to verify round-robin distribution and proper header responses.

- **Database Optimization**: I designed the database schema to handle concurrent transactions and provide real-time statistics for the dashboard.

## Technologies Used

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **SQLite3**: Lightweight database for transaction storage

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design and styling
- **Vanilla JavaScript**: Client-side interactivity and API calls

### External APIs
- **Flutterwave Payment API**: Professional payment processing service
  - [Official Documentation](https://developer.flutterwave.com/)
  - [Test Cards](https://developer.flutterwave.com/docs/test-cards)
  - [API Reference](https://developer.flutterwave.com/reference)

### Deployment & Infrastructure
- **Docker**: Application containerization
- **Docker Hub**: Image registry (`gedeon250/payment-app:v1`)
- **HAProxy**: Load balancer for traffic distribution
- **Lab Infrastructure**: Multi-container deployment environment

## Features Implemented

### Core Functionality
- **Payment Processing**: Real integration with Flutterwave API
- **Form Validation**: Client-side and server-side validation
- **Transaction Tracking**: Complete payment lifecycle management
- **Dashboard Analytics**: Real-time payment statistics and history
- **Responsive Design**: Works on desktop and mobile devices

### User Experience
- **Intuitive Interface**: Clean, professional payment form
- **Real-time Feedback**: Loading states, success/error messages
- **Payment History**: Complete transaction tracking
- **Statistics Dashboard**: Payment analytics and insights

### Technical Features
- **Error Handling**: Comprehensive error management
- **Data Persistence**: SQLite database for transaction storage
- **Load Balancing**: HAProxy round-robin distribution
- **Containerization**: Docker deployment ready
- **Security**: Proper API key management and input validation

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Gedeon-PaymentApp.git
   cd Gedeon-PaymentApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Payment Form: `http://localhost:8080`
   - Dashboard: `http://localhost:8080/dashboard`

### Environment Variables
Create a `.env` file for local development:
```bash
PORT=8080
NODE_ENV=development
FLUTTERWAVE_PUBLIC_KEY=your_test_public_key
```

## Docker Deployment

### Build Instructions

1. **Build the Docker image**
   ```bash
   docker build -t gedeon250/payment-app:v1 .
   ```

2. **Test locally**
   ```bash
   docker run -d --name test-app -p 8080:8080 gedeon250/payment-app:v1
   curl http://localhost:8080
   docker stop test-app && docker rm test-app
   ```

3. **Push to Docker Hub**
   ```bash
   docker login
   docker push gedeon250/payment-app:v1
   ```

### Docker Image Details
- **Repository**: `gedeon250/payment-app`
- **Tag**: `v1`
- **Size**: ~233MB
- **Base Image**: `node:18-slim`

## Lab Environment Deployment

### Prerequisites
- Docker and Docker Compose installed
- Access to the lab infrastructure
- SSH access to lab containers

### Step 1: Start Lab Infrastructure
```bash
cd web_infra_lab
docker compose up -d --build
docker compose ps
```

### Step 2: Deploy on Web01
```bash
# SSH into Web01
ssh ubuntu@localhost -p 2211
# Password: pass123

# Create application directory
mkdir -p ~/payment-app
cd ~/payment-app

# Copy application files from host
# (From your host machine terminal)
scp -P 2211 -r /path/to/Gedeon-PaymentApp/* ubuntu@localhost:~/payment-app/

# Install dependencies
npm install

# Start the application
PORT=80 nohup npm start > app.log 2>&1 &

# Verify it's running
curl http://localhost:80
```

### Step 3: Deploy on Web02
```bash
# SSH into Web02
ssh ubuntu@localhost -p 2212
# Password: pass123

# Repeat the same steps as Web01
mkdir -p ~/payment-app
cd ~/payment-app
# Copy files and start application
```

### Step 4: Configure Load Balancer
```bash
# SSH into Lb01
ssh ubuntu@localhost -p 2210
# Password: pass123

# Install HAProxy
sudo apt update
sudo apt install -y haproxy

# Edit HAProxy configuration
sudo nano /etc/haproxy/haproxy.cfg
```

**HAProxy Configuration:**
```haproxy
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
    server web01 172.20.0.11:80 check
    server web02 172.20.0.12:80 check
    http-response set-header X-Served-By %[srv_name]
```

**Start HAProxy:**
```bash
sudo haproxy -f /etc/haproxy/haproxy.cfg -D
ps aux | grep haproxy
```

## Testing and Verification

### 1. Test Individual Servers
```bash
# Test Web01
curl -I http://localhost:8080
# Expected: HTTP/1.1 200 OK

# Test Web02
curl -I http://localhost:8081
# Expected: HTTP/1.1 200 OK
```

### 2. Test Load Balancer
```bash
# Test load balancer
curl -I http://localhost:8082
# Expected: HTTP/1.1 200 OK
```

### 3. Verify Round-Robin Load Balancing
```bash
# Make multiple requests to see load balancing
for i in {1..6}; do
  echo "Request $i:"
  curl -s -I http://localhost:8082 | grep "X-Served-By"
done
```

**Expected Output:**
```
Request 1: x-served-by: web01
Request 2: x-served-by: web02
Request 3: x-served-by: web01
Request 4: x-served-by: web02
Request 5: x-served-by: web01
Request 6: x-served-by: web02
```

### 4. Test Application Functionality
```bash
# Test payment page
curl -s http://localhost:8082 | grep -i "payment"
```

## API Integration Details

### Flutterwave API Usage

This project integrates with Flutterwave's payment processing API to handle real payment transactions. The integration includes:

- **Payment Initialization**: Creating payment sessions with unique transaction references
- **Callback Handling**: Processing payment responses and updating transaction status
- **Error Management**: Handling failed payments and network issues
- **Test Environment**: Using Flutterwave's test API for development

### API Security

- **Public Key Management**: API keys are stored securely and not exposed in client-side code
- **Transaction Verification**: All payments are verified through Flutterwave's verification endpoints
- **Input Validation**: Comprehensive validation to prevent malicious input

### Test Payment Details

For testing purposes, use these Flutterwave test credentials:
- **Test Card**: 4187427415564246
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **PIN**: 3310
- **OTP**: 12345

## Security Considerations

### API Key Management
- API keys are stored in environment variables
- No sensitive data is committed to the repository
- Test keys are used for development

### Input Validation
- Client-side validation for immediate user feedback
- Server-side validation for security
- SQL injection prevention through parameterized queries

### Error Handling
- Graceful handling of API failures
- User-friendly error messages
- Comprehensive logging for debugging

## Project Structure

```
Gedeon-PaymentApp/
├── server.js              # Express server and API routes
├── database.js            # SQLite database operations
├── package.json           # Node.js dependencies
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Local development setup
├── index.html             # Payment form page
├── public/                # Static assets
│   ├── dashboard.html     # Payment dashboard
│   ├── dashboard.js       # Dashboard functionality
│   ├── payment.js         # Payment processing logic
│   └── style.css          # Application styling
├── web_infra_lab/         # Lab environment setup
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## Challenges and Solutions

### Docker Deployment Challenges
**Problem**: Docker-in-Docker limitations in the lab environment prevented running Docker containers within the lab containers.

**Solution**: Developed a hybrid approach:
1. Built and pushed Docker image to meet assignment requirements
2. Deployed application directly using Node.js on lab containers
3. Documented the approach transparently

### API Integration Learning Curve
**Problem**: Understanding Flutterwave's API documentation and implementing proper error handling.

**Solution**: 
1. Studied API documentation thoroughly
2. Implemented comprehensive error handling
3. Used test environment for development
4. Added proper transaction verification

### Load Balancer Configuration
**Problem**: Configuring HAProxy to properly distribute traffic and verify load balancing.

**Solution**:
1. Researched HAProxy configuration options
2. Implemented round-robin load balancing
3. Added custom headers for verification
4. Created comprehensive testing procedures

## Future Enhancements

If I were to continue developing this project, I would consider:

1. **User Authentication**: Implement user accounts and session management
2. **Payment Webhooks**: Add webhook support for real-time payment notifications
3. **Advanced Analytics**: Enhanced reporting and business intelligence features
4. **Mobile App**: Native mobile application for payment processing
5. **Multi-currency Support**: Support for different currencies and exchange rates
6. **Advanced Security**: Two-factor authentication and fraud detection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions about this project or the implementation, please refer to the GitHub repository or contact me through the provided channels.

---

**Note**: This project was developed as part of an academic assignment to demonstrate API integration and deployment skills. The payment processing functionality uses Flutterwave's test environment and should not be used for real financial transactions without proper production setup and security measures.

