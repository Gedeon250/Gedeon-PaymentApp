# Simple Payment Platform - Flutterwave API Integration

## Project Overview

This is a **simple payment platform** built with **vanilla HTML, CSS, and JavaScript** that demonstrates real **Flutterwave API integration** for processing payments. The project is designed to be beginner-friendly while showcasing professional API usage.

## Technologies Used

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Payment API**: Flutterwave Payment API
- **Storage**: Local Storage (for payment tracking)
- **Server**: Python HTTP Server (for development)

## Features

### Core Functionality
- **Real Flutterwave API Integration** - Uses actual Flutterwave test API
- **Multiple Payment Methods** - Cards, Mobile Money, USSD, Bank Transfer
- **Form Validation** - Client-side validation for all fields
- **Payment Tracking** - Local storage-based transaction tracking
- **Responsive Design** - Works on desktop and mobile devices
- **Dashboard** - View payment statistics and history

### Payment Processing Features
- **Secure Payment Processing** via Flutterwave
- **Transaction References** - Unique reference generation
- **Payment Status Tracking** - Success, Failed, Cancelled states
- **Detailed Transaction Information** - Transaction IDs, fees, payment methods
- **Error Handling** - Comprehensive error management

## API Integration Details

### Flutterwave API Usage

This project demonstrates **real API integration** with Flutterwave:

```javascript
// Real Flutterwave API Call
FlutterwaveCheckout({
    public_key: 'FLWPUBK_TEST-40ee1e2361c9ffa8ca5b4e869cb4ce7d-X',
    tx_ref: 'RW-PAY-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    amount: amount,
    currency: "RWF",
    payment_options: "card, mobilemoney, ussd, bank_transfer",
    customer: {
        email: email,
        phone_number: phone,
        name: name,
    },
    customizations: {
        title: "Simple Payment Platform - Flutterwave Integration",
        description: "Payment processing via Flutterwave API",
        logo: "https://assets.flutterwave.com/icons/flutterwave-icon.png",
    },
    callback: function(response) {
        // Handle successful payment
        console.log('Flutterwave Response:', response);
        // Update UI and store transaction details
    }
});
```

### API Features Demonstrated
- **Payment Initialization** - Creating payment sessions
- **Callback Handling** - Processing payment responses  
- **Transaction Tracking** - Storing transaction details
- **Error Management** - Handling failed payments
- **Multiple Payment Options** - Cards, Mobile Money, etc.

## How to Run

### Method 1: Using Python HTTP Server (Recommended)

1. **Clone/Download** the project files
2. **Navigate** to the project directory:
   ```bash
   cd PaymentApp_JosephNishimwe-main
   ```
3. **Start the server**:
   ```bash
   python3 -m http.server 8080
   ```
4. **Access the application**:
   - Payment Form: `http://localhost:8080/index.html`
   - Dashboard: `http://localhost:8080/dashboard.html`

### Method 2: Direct File Access

1. Open `index.html` directly in your browser
2. Navigate to `dashboard.html` for payment tracking

## Usage Instructions

### Making a Payment

1. **Fill the form** with valid details:
   - Full Name (minimum 2 characters)
   - Valid email address
   - Rwandan phone number (078XXXXXXX or 079XXXXXXX)
   - Amount (minimum 100 RWF)

2. **Click "Pay Now"** - This will:
   - Validate your input
   - Initialize Flutterwave API
   - Open Flutterwave payment modal
   - Process payment securely

3. **Complete payment** using:
   - Test Cards (provided by Flutterwave)
   - Mobile Money simulation
   - Other payment methods

4. **View results** - Success/failure messages with transaction details

### Viewing Dashboard

1. **Click "View Dashboard"** from payment page
2. **See statistics**:
   - Total payments
   - Successful payments  
   - Failed payments
   - Total amount processed

3. **View transaction details**:
   - Flutterwave transaction IDs
   - Payment methods used
   - Fees charged
   - Timestamps
   - API response details

## API Testing

### Test Payment Details

Use these **Flutterwave test details** for testing:

**Test Card Numbers:**
- **Visa**: 4187427415564246
- **Mastercard**: 5531886652142950
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **PIN**: 3310
- **OTP**: 12345

**Test Mobile Money:**
- Use any valid phone number format
- Follow Flutterwave test prompts

## Project Structure

```
PaymentApp/
├── index.html          # Main payment form
├── dashboard.html      # Payment tracking dashboard  
├── style.css          # Styling for all pages
├── payment.js         # Flutterwave API integration
├── README.md          # Project documentation
└── server files...    # Additional backend files
```

## Key Code Highlights

### 1. Form Validation
```javascript
function validate(name, email, phone, amount) {
    // Comprehensive validation for all fields
    const phoneRegex = /^07[2389]\\d{7}$/;
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    // ... validation logic
}
```

### 2. Payment Storage
```javascript
function storePayment(payment) {
    payment.timestamp = new Date().toISOString();
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    payments.unshift(payment);
    localStorage.setItem('payments', JSON.stringify(payments));
}
```

### 3. API Response Handling
```javascript
callback: function(response) {
    if (response.status === "successful") {
        // Store detailed transaction information
        const updatedPayment = {
            status: 'successful',
            transaction_id: response.transaction_id,
            flw_ref: response.flw_ref,
            payment_method: response.payment_type,
            // ... more details
        };
    }
}
```

## API Impact & Demonstration

This project clearly demonstrates:

1. **Real API Integration** - Not simulated, uses actual Flutterwave API
2. **Professional Payment Processing** - Handles real payment flows
3. **Comprehensive Error Handling** - Manages API errors gracefully  
4. **Transaction Management** - Tracks API responses and details
5. **Multiple Payment Methods** - Leverages Flutterwave's full API capabilities
6. **Security Best Practices** - Uses public keys, handles sensitive data properly

## Important Notes

- **Test Mode**: Currently using Flutterwave test API keys
- **No Real Money**: All transactions are simulated for testing
- **Internet Required**: Flutterwave API requires internet connection
- **Browser Compatibility**: Modern browsers with JavaScript enabled

## Future Enhancements

- Add payment verification webhook
- Implement proper backend database
- Add more payment methods
- Integrate email notifications
- Add user authentication

## Support

For issues or questions:
- Check browser console for API logs
- Verify internet connection for Flutterwave API
- Ensure valid test data is used
- Review Flutterwave documentation

