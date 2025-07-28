// Simple Payment Platform JavaScript
// Using Flutterwave API for payments with clean error handling

const PUBLIC_KEY = 'FLWPUBK_TEST-40ee1e2361c9ffa8ca5b4e869cb4ce7d-X';

// Helper function to show/hide elements
function showElement(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

function hideElement(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// Clear all error messages
function clearErrors() {
    const errorElements = ['nameError', 'emailError', 'phoneError', 'amountError'];
    errorElements.forEach(id => {
        document.getElementById(id).textContent = '';
    });
    hideElement('errorMessage');
    hideElement('successMessage'); 
}

// Validate form data
function validateForm(name, email, phone, amount) {
    let isValid = true;
    clearErrors();

    // Validate name
    if (!name || name.trim().length < 2) {
        document.getElementById('nameError').textContent = 'Please enter a valid full name';
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    // Validate phone number (Rwandan format - more flexible)
    const phoneRegex = /^(\+?25)?07[2389]\d{7}$/;
    const cleanPhone = phone.replace(/[\s-+]/g, '');
    if (!phone || !phoneRegex.test(cleanPhone)) {
        document.getElementById('phoneError').textContent = 'Please enter a valid Rwandan phone number (078XXXXXXX, 079XXXXXXX, 072XXXXXXX, or 073XXXXXXX)';
        isValid = false;
    }

    // Validate amount
    if (!amount || amount < 100) {
        document.getElementById('amountError').textContent = 'Amount must be at least 100 RWF';
        isValid = false;
    }

    return isValid;
}

// Save payment to database
async function savePaymentToDatabase(paymentData) {
    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        
        return result;
    } catch (error) {
        console.error('Error saving payment:', error);
        throw error;
    }
}

// Update payment status after verification
async function updatePaymentStatus(tx_ref, transaction_id, status) {
    try {
        const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tx_ref,
                transaction_id,
                status
            })
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message);
        }
        
        return result;
    } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
    }
}

// Main payment function
async function makePayment() {
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    // Validate form
    if (!validateForm(name, email, phone, amount)) {
        return;
    }

    // Generate unique transaction reference
    const tx_ref = 'RW-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    try {
        // Show loading state
        showElement('loadingMessage');
        document.getElementById('payButton').disabled = true;
        document.getElementById('payButton').textContent = 'Processing...';

        // Save payment to database first
        await savePaymentToDatabase({
            name,
            email,
            phone,
            amount,
            tx_ref
        });

        // Initialize Flutterwave payment
        FlutterwaveCheckout({
            public_key: PUBLIC_KEY,
            tx_ref: tx_ref,
            amount: amount,
            currency: "RWF",
            payment_options: "card, mobilemoney, ussd",
            customer: {
                email: email,
                phone_number: phone,
                name: name,
            },
            customizations: {
                title: "Simple Payment Platform",
                description: "Payment for services",
                logo: "https://cdn.pixabay.com/photo/2016/08/15/18/22/currency-1596062_1280.png",
            },
            callback: async function(response) {
                hideElement('loadingMessage');
                
                if (response.status === "successful") {
                    try {
                        // Update payment status in database
                        await updatePaymentStatus(tx_ref, response.transaction_id, 'successful');
                        
                        // Show success message
                        showElement('successMessage');
                        document.getElementById('successMessage').innerHTML = `
                            <h3>Payment Successful!</h3>
                            <p>Transaction ID: ${response.transaction_id}</p>
                            <p>Reference: ${tx_ref}</p>
                        `;
                        
                        // Clear form
                        document.getElementById('paymentForm').reset();
                        
                    } catch (error) {
                        console.error('Error updating payment status:', error);
                        showElement('errorMessage');
                        document.getElementById('errorMessage').textContent = 'Payment completed but failed to update records.';
                    }
                } else {
                    // Payment failed
                    try {
                        await updatePaymentStatus(tx_ref, response.transaction_id || '', 'failed');
                    } catch (error) {
                        console.error('Error updating failed payment status:', error);
                    }
                    
                    showElement('errorMessage');
                    document.getElementById('errorMessage').textContent = 'Payment failed. Please try again.';
                }
                
                // Re-enable button
                document.getElementById('payButton').disabled = false;
                document.getElementById('payButton').textContent = 'Pay Now';
            },
            onclose: function() {
                // Handle when payment modal is closed without completion
                hideElement('loadingMessage');
                document.getElementById('payButton').disabled = false;
                document.getElementById('payButton').textContent = 'Pay Now';
            }
        });

    } catch (error) {
        console.error('Payment initialization error:', error);
        hideElement('loadingMessage');
        showElement('errorMessage');
        document.getElementById('errorMessage').textContent = 'Failed to initialize payment. Please try again.';
        
        // Re-enable button
        document.getElementById('payButton').disabled = false;
        document.getElementById('payButton').textContent = 'Pay Now';
    }
}

// Add CSS for hidden class if not already present
if (!document.querySelector('style[data-hidden-class]')) {
    const style = document.createElement('style');
    style.setAttribute('data-hidden-class', 'true');
    style.textContent = `.hidden { display: none !important; }`;
    document.head.appendChild(style);
}
