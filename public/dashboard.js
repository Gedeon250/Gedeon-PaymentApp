// Enhanced dashboard to display recent payments and stats with better UI
const renderDashboard = async () => {
    const paymentList = document.querySelector('#paymentList');
    const statsDiv = document.querySelector('#stats');

    try {
        // Show loading states
        statsDiv.innerHTML = `
            <div class="stats-card">
                <h3>Loading Statistics...</h3>
                <div class="loading">Please wait while we load your payment statistics...</div>
            </div>
        `;
        paymentList.innerHTML = '<li class="loading">Loading payment history...</li>';

        // Fetch data
        const [paymentsResponse, statsResponse] = await Promise.all([
            fetch('/api/payments'),
            fetch('/api/stats')
        ]);

        if (!paymentsResponse.ok || !statsResponse.ok) {
            throw new Error('Failed to fetch data from server');
        }

        const paymentsData = await paymentsResponse.json();
        const statsData = await statsResponse.json();

        // Display payment statistics with enhanced styling
        const stats = statsData.stats;
        statsDiv.innerHTML = `
            <div class="stats-card">
                <h3>Payment Summary</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.total_payments || 0}</div>
                        <div class="stat-label">Total Payments</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.successful_payments || 0}</div>
                        <div class="stat-label">Successful</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.pending_payments || 0}</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.failed_payments || 0}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">RWF ${(stats.total_successful_amount || 0).toLocaleString()}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                </div>
            </div>
        `;

        // Clear payment list
        paymentList.innerHTML = '';

        // Populate payment list or show empty state
        if (paymentsData.payments && paymentsData.payments.length > 0) {
            paymentsData.payments.forEach(payment => {
                const li = document.createElement('li');
                const statusClass = `status-${payment.status}`;
                const formattedDate = new Date(payment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                li.innerHTML = `
                    <div class="payment-entry">
                        <div class="payment-name">${payment.name}</div>
                        <div class="payment-amount">RWF ${payment.amount.toLocaleString()}</div>
                        <div class="entry-details">
                            <span>Email: ${payment.email}</span>
                            <span>Phone: ${payment.phone}</span>
                            <span class="status-badge ${statusClass}">${payment.status}</span>
                        </div>
                        <div class="entry-details">
                            <span>Ref: ${payment.tx_ref}</span>
                            <span>Date: ${formattedDate}</span>
                        </div>
                    </div>
                `;
                paymentList.appendChild(li);
            });
        } else {
            // Show empty state
            paymentList.innerHTML = `
                <li>
                    <div class="empty-state">
                        <div class="empty-state-icon">No Data</div>
                        <div class="empty-state-text">No payments yet</div>
                        <div class="empty-state-subtext">Payments will appear here once customers start making transactions</div>
                    </div>
                </li>
            `;
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // Show error states
        statsDiv.innerHTML = `
            <div class="stats-card">
                <h3>Error Loading Statistics</h3>
                <div class="error-message">Unable to load payment statistics. Please refresh the page.</div>
            </div>
        `;
        
        paymentList.innerHTML = `
            <li>
                <div class="error-message">Error loading payments. Please check your connection and try again.</div>
            </li>
        `;
    }
};

document.addEventListener('DOMContentLoaded', renderDashboard);
