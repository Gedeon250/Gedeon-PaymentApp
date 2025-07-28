const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-40ee1e2361c9ffa8ca5b4e869cb4ce7d-X';

// Helper functions for UI management
function showMessage(messageId) {
    const element = document.getElementById(messageId);
    if (element) {
        element.classList.remove('hidden');
        element.style.display = 'block';
    }
}

function hideMessage(messageId) {
    const element = document.getElementById(messageId);
    if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}

function clearErrors() {
    // Clear all error messages
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(el => {
        el.textContent = '';
    });
    hideMessage('errorMessage');
    hideMessage('successMessage');
}

// Form validation function
function validate(name, email, phone, amount) {
    clearErrors();
    let valid = true;

    // Validate name (minimum 2 characters)
    if (!name || name.trim().length < 2) {
        document.getElementById('nameError').textContent = 'Please enter your full name (minimum 2 characters)';
        valid = false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        valid = false;
    }

    // Validate Rwandan phone number format
    const phoneRegex = /^07[2389]\d{7}$/;
    if (!phone || !phoneRegex.test(phone)) {
        document.getElementById('phoneError').textContent = 'Please enter a valid Rwandan phone number (078XXXXXXX or 079XXXXXXX)';
        valid = false;
    }

    // Validate amount (minimum 100 RWF)
    if (!amount || amount < 100) {
        document.getElementById('amountError').textContent = 'Minimum amount is 100 RWF';
        valid = false;
    }

    return valid;
}

// Store payment data locally for tracking
function storePayment(payment) {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    payment.timestamp = new Date().toISOString();
    payments.unshift(payment); // Add to beginning of array
    localStorage.setItem('payments', JSON.stringify(payments));
    console.log('Payment stored:', payment);
}

// Main payment processing function using Flutterwave API
function makePayment() {
    console.log('=== FLUTTERWAVE PAYMENT PROCESS STARTED ===');
    
    // Get form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    console.log('Form data collected:', { name, email, phone, amount });

    // Validate form data
    if (!validate(name, email, phone, amount)) {
        console.log('Validation failed');
        return;
    }

    console.log('Validation passed, initializing Flutterwave...');

    // Generate unique transaction reference
    const tx_ref = 'RW-PAY-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    console.log('Transaction reference generated:', tx_ref);

    // Show loading state
    document.getElementById('payButton').disabled = true;
    document.getElementById('payButton').textContent = 'Processing...';
    showMessage('loadingMessage');

    // Store initial payment record
    const paymentData = {
        name,
        email,
        phone,
        amount,
        txRef: tx_ref,
        status: 'pending',
        api_used: 'Flutterwave',
        payment_method: 'Not selected yet'
    };
    storePayment(paymentData);

    console.log('=== INITIALIZING FLUTTERWAVE CHECKOUT ===');

    // Initialize Flutterwave Checkout - THIS IS THE REAL API CALL
    FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: tx_ref,
        amount: amount,
        currency: "RWF",
        payment_options: "card, mobilemoney, ussd, bank_transfer",
        redirect_url: window.location.origin + '/payment-success.html',
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
            console.log('=== FLUTTERWAVE CALLBACK RECEIVED ===');
            console.log('Full Flutterwave Response:', response);
            
            hideMessage('loadingMessage');
            
            if (response.status === "successful") {
                console.log('Payment successful via Flutterwave!');
                console.log('Transaction ID:', response.transaction_id);
                console.log('Flutterwave Ref:', response.flw_ref);
                
                // Update payment record with success details
                const updatedPayment = {
                    ...paymentData,
                    status: 'successful',
                    transaction_id: response.transaction_id,
                    flw_ref: response.flw_ref,
                    amount_charged: response.amount,
                    currency: response.currency,
                    payment_method: response.payment_type || 'Unknown',
                    charged_amount: response.charged_amount,
                    app_fee: response.app_fee,
                    merchant_fee: response.merchant_fee,
                    processor_response: response.processor_response
                };
                storePayment(updatedPayment);
                
                // Show success message with Flutterwave details
                showMessage('successMessage');
                document.getElementById('successMessage').innerHTML = `
                    <h3>Payment Successful via Flutterwave!</h3>
                    <p><strong>Transaction ID:</strong> ${response.transaction_id}</p>
                    <p><strong>Flutterwave Reference:</strong> ${response.flw_ref}</p>
                    <p><strong>Amount Charged:</strong> ${response.currency} ${response.charged_amount}</p>
                    <p><strong>Payment Method:</strong> ${response.payment_type || 'Card/Mobile Money'}</p>
                    <p><strong>Reference:</strong> ${tx_ref}</p>
                    <small>Powered by Flutterwave API</small>
                `;
                
                // Clear form after successful payment
                document.getElementById('paymentForm').reset();
                
            } else {
                console.log('Payment failed via Flutterwave');
                console.log('Failure reason:', response);
                
                // Update payment record with failure details
                const failedPayment = {
                    ...paymentData,
                    status: 'failed',
                    failure_reason: response.status || 'Unknown error',
                    flw_ref: response.flw_ref || 'N/A'
                };
                storePayment(failedPayment);
                
                showMessage('errorMessage');
                document.getElementById('errorMessage').innerHTML = `
                    <h3>Payment Failed</h3>
                    <p>Transaction could not be completed via Flutterwave.</p>
                    <p><strong>Reference:</strong> ${tx_ref}</p>
                    <p>Please try again or contact support.</p>
                `;
            }
            
            // Re-enable button
            document.getElementById('payButton').disabled = false;
            document.getElementById('payButton').textContent = 'Pay Now';
        },
        onclose: function() {
            console.log('Flutterwave modal closed by user');
            
            // Update payment as cancelled
            const cancelledPayment = {
                ...paymentData,
                status: 'cancelled',
                cancellation_reason: 'User closed payment modal'
            };
            storePayment(cancelledPayment);
            
            hideMessage('loadingMessage');
            document.getElementById('payButton').disabled = false;
            document.getElementById('payButton').textContent = 'Pay Now';
            
            // Show cancellation message
            showMessage('errorMessage');
            document.getElementById('errorMessage').innerHTML = `
                <h3>Payment Cancelled</h3>
                <p>Payment process was cancelled.</p>
                <p>You can try again when ready.</p>
            `;
        }
    });

    console.log('Flutterwave checkout initialized successfully');
}

// Add hidden class CSS if not present
if (!document.querySelector('style[data-hidden-class]')) {
    const style = document.createElement('style');
    style.setAttribute('data-hidden-class', 'true');
    style.textContent = `
        .hidden { 
            display: none !important; 
        }
        .loading {
            animation: pulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes pulse {
            from { opacity: 1; }
            to { opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
}

// Log when script loads
console.log('=== FLUTTERWAVE PAYMENT SCRIPT LOADED ===');
console.log('Public Key:', FLUTTERWAVE_PUBLIC_KEY);
console.log('Flutterwave Integration Ready!');

// Check if Flutterwave script is loaded
if (typeof FlutterwaveCheckout === 'undefined') {
    console.error('Flutterwave script not loaded! Please check internet connection.');
} else {
    console.log('Flutterwave API script loaded successfully!');
}
