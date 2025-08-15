export const generatePremiumInvoiceHTML = (invoice: any, charges: any[], business: any, client: any, base64Image: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #${invoice.number} - ${business.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
        }
        
        .invoice-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 48px;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 120%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        .header-content {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 32px;
            align-items: start;
            position: relative;
            z-index: 1;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .logo {
            width: 90px;
            height: 90px;
            border-radius: 20px;
            background: white;
            object-fit: contain;
            padding: 8px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .logo:hover {
            transform: scale(1.05);
        }
        
        .business-info .name {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            letter-spacing: -0.025em;
        }
        
        .business-details {
            font-size: 1.1rem;
            margin-bottom: 6px;
            opacity: 0.95;
            font-weight: 400;
        }
        
        .invoice-header {
            text-align: right;
        }
        
        .invoice-title {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 12px;
            letter-spacing: -0.05em;
            text-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .invoice-number {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 8px;
            opacity: 0.95;
        }
        
        .invoice-date {
            font-size: 1.1rem;
            opacity: 0.85;
            font-weight: 400;
        }
        
        .client-section {
            padding: 40px 48px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-left: 6px solid #667eea;
        }
        
        .bill-to-label {
            font-size: 1.2rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .client-info {
            display: grid;
            gap: 8px;
        }
        
        .client-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
        }
        
        .client-detail {
            font-size: 1.1rem;
            color: #4b5563;
            font-weight: 500;
        }
        
        .content-section {
            padding: 48px;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 24px;
            color: #1f2937;
            position: relative;
            padding-bottom: 12px;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
        }
        
        .charges-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
        }
        
        .charges-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .charges-table th {
            padding: 20px 24px;
            font-weight: 700;
            font-size: 1rem;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: left;
        }
        
        .charges-table th:last-child {
            text-align: right;
        }
        
        .charges-table tbody tr {
            transition: all 0.2s ease;
        }
        
        .charges-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .charges-table tbody tr:hover {
            background: #e2e8f0;
            transform: scale(1.01);
        }
        
        .charges-table td {
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        
        .charge-description {
            font-weight: 600;
            color: #374151;
            font-size: 1rem;
        }
        
        .charge-amount {
            font-weight: 700;
            color: #059669;
            font-size: 1.1rem;
            text-align: right;
        }
        
        .summary-section {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 40px 48px;
            margin-top: 32px;
            border-radius: 20px;
            position: relative;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: start;
        }
        
        .summary-details {
            background: white;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-row:last-child {
            border-bottom: none;
            margin-top: 12px;
            padding-top: 20px;
            border-top: 3px solid #667eea;
            font-size: 1.2rem;
        }
        
        .summary-label {
            font-weight: 600;
            color: #374151;
        }
        
        .summary-value {
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .total-amount {
            color: #667eea;
            font-size: 1.4rem;
        }
        
        .paid-amount {
            color: #059669;
        }
        
        .due-amount {
            color: #dc2626;
        }
        
        .payment-section {
            background: white;
            padding: 32px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
        }
        
        .payment-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .payment-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1f2937;
        }
        
        .pay-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 36px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 24px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .pay-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
        }
        
        .qr-section {
            margin-top: 20px;
        }
        
        .qr-label {
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 16px;
            font-weight: 500;
        }
        
        .qr-code {
            width: 140px;
            height: 140px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border: 4px solid white;
        }
        
        .footer {
            background: #1f2937;
            color: white;
            text-align: center;
            padding: 32px 48px;
            font-size: 0.95rem;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .footer-section h4 {
            font-weight: 700;
            margin-bottom: 12px;
            color: #f9fafb;
        }
        
        .footer-section p {
            opacity: 0.8;
            line-height: 1.6;
        }
        
        .footer-bottom {
            border-top: 1px solid #374151;
            padding-top: 24px;
            opacity: 0.7;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
            .pay-button {
                display: none;
            }
        }
        
        @media (max-width: 768px) {
            .header-content {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 24px;
            }
            
            .invoice-header {
                text-align: center;
            }
            
            .summary-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .content-section,
            .client-section {
                padding: 24px;
            }
            
            .invoice-title {
                font-size: 2rem;
            }
            
            .business-info .name {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <header class="header">
            <div class="header-content">
                <div class="logo-section">
                    <img src="${base64Image}" alt="${business.name} Logo" class="logo">
                </div>
                <div class="business-info">
                    <h1 class="name">${business.name}</h1>
                    <div class="business-details">${business.address}</div>
                    <div class="business-details">${business.phone}</div>
                    <div class="business-details">${business.email}</div>
                </div>
                <div class="invoice-header">
                    <h1 class="invoice-title">INVOICE</h1>
                    <div class="invoice-number">#${invoice.number}</div>
                    <div class="invoice-date">${formatInvoiceDate(new Date(invoice.date))}</div>
                </div>
            </div>
        </header>
        
        <section class="client-section">
            <div class="bill-to-label">Bill to:</div>
            <div class="client-info">
                <div class="client-name">${client.name}</div>
                <div class="client-detail">📧 ${client.email}</div>
                <div class="client-detail">📞 ${client.phone}</div>
                <div class="client-detail">📍 ${client.address}</div>
            </div>
        </section>
        
        <section class="content-section">
            <h2 class="section-title">Service Details</h2>
            <table class="charges-table">
                <thead>
                    <tr>
                        <th>Service Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${charges.map((charge: any) => `
                    <tr>
                        <td class="charge-description">${charge.description}</td>
                        <td class="charge-amount">$${parseFloat(charge.amount).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>
        
        <section class="summary-section">
            <div class="summary-grid">
                <div class="summary-details">
                    <div class="summary-row">
                        <span class="summary-label">Subtotal:</span>
                        <span class="summary-value">$${parseFloat(invoice.total).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Paid:</span>
                        <span class="summary-value paid-amount">$${parseFloat(invoice.paid).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Balance Due:</span>
                        <span class="summary-value due-amount total-amount">$${parseFloat(invoice.due).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</span>
                    </div>
                </div>
                
                <div class="payment-section">
                    <h3 class="payment-title">💳 Make Payment</h3>
                    <a href="${invoice.payUrl || `https://abt.qbared.com/jobs/invoice/${invoice.number}/`}" 
                       class="pay-button">
                        Pay Now
                    </a>
                    <div class="qr-section">
                        <div class="qr-label">Or scan this QR code:</div>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&format=png&data=${encodeURIComponent(
                            invoice.payUrl || `https://abt.qbared.com/jobs/invoice/${invoice.number}/`
                        )}" 
                             alt="QR code for payment" 
                             class="qr-code">
                    </div>
                </div>
            </div>
        </section>
        
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p>${business.phone}<br>${business.email}</p>
                </div>
                <div class="footer-section">
                    <h4>Information</h4>
                    <p>Invoice generated automatically<br>Date: ${new Date().toLocaleDateString('en-US')}</p>
                </div>
                <div class="footer-section">
                    <h4>Thank you</h4>
                    <p>We appreciate your trust in<br>${business.name}</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
            </div>
        </footer>
    </div>
</body>
</html>
`;

function formatInvoiceDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    };
    return date.toLocaleDateString('en-US', options);
}
