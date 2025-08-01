const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Add custom header to identify server instance
app.use((req, res, next) => {
    res.setHeader('X-Served-By', `Payment-Server-${PORT}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Routes
app.post('/api/payments', async (req, res) => {
    try {
        const { name, email, phone, amount, tx_ref } = req.body;
        
        // Save payment to database with pending status
        const paymentId = await db.savePayment({
            name,
            email,
            phone,
            amount,
            tx_ref,
            status: 'pending'
        });

        res.json({ 
            success: true, 
            paymentId,
            message: 'Payment initiated successfully' 
        });
    } catch (error) {
        console.error('Error saving payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to initiate payment' 
        });
    }
});

// Update payment status after Flutterwave callback
app.post('/api/payments/verify', async (req, res) => {
    try {
        const { tx_ref, transaction_id, status } = req.body;
        
        // Update payment status in database
        await db.updatePaymentStatus(tx_ref, {
            status,
            transaction_id,
            verified_at: new Date().toISOString()
        });

        res.json({ 
            success: true, 
            message: 'Payment status updated successfully' 
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update payment status' 
        });
    }
});

// Get all payments for dashboard
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await db.getAllPayments();
        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch payments' 
        });
    }
});

// Get payment statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getPaymentStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch statistics' 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Payment page: http://localhost:${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
});
