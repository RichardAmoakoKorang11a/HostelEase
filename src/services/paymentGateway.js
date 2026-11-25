const https = require('https');

/**
 * Paystack Payment Gateway Service
 * Supports Paystack REST API (GHS Mobile Money & Card) with automatic offline sandbox fallback.
 */
class PaymentGateway {
    constructor() {
        this.baseUrl = 'api.paystack.co';
    }

    getSecretKey() {
        return process.env.PAYSTACK_SECRET_KEY || '';
    }

    getPublicKey() {
        return process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_hostelease_sandbox';
    }

    isLiveConfigured() {
        const key = this.getSecretKey();
        return Boolean(key && key.startsWith('sk_') && !key.includes('mock'));
    }

    _request(method, path, payload = null) {
        return new Promise((resolve, reject) => {
            const body = payload ? JSON.stringify(payload) : null;
            const options = {
                hostname: this.baseUrl,
                path,
                method,
                headers: {
                    Authorization: `Bearer ${this.getSecretKey()}`,
                    'Content-Type': 'application/json'
                },
                timeout: 8000
            };

            if (body) {
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }

            const req = https.request(options, (res) => {
                let raw = '';
                res.on('data', (chunk) => { raw += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(raw || '{}');
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(parsed);
                        } else {
                            reject(new Error(parsed.message || `Paystack HTTP ${res.statusCode}`));
                        }
                    } catch (err) {
                        reject(new Error('Invalid JSON response from Paystack API'));
                    }
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Paystack API request timed out'));
            });
            req.on('error', reject);

            if (body) req.write(body);
            req.end();
        });
    }

    async initializePayment({ reference, amount, email, callbackUrl }) {
        if (this.isLiveConfigured()) {
            try {
                const res = await this._request('POST', '/transaction/initialize', {
                    email: email || 'student@campus.edu',
                    amount: Math.round(Number(amount) * 100),
                    currency: 'GHS',
                    reference,
                    channels: ['mobile_money', 'card'],
                    callback_url: callbackUrl || undefined
                });

                if (res && res.status && res.data) {
                    return {
                        status: true,
                        mode: 'PAYSTACK_API',
                        message: res.message || 'Authorization URL created',
                        checkoutUrl: res.data.authorization_url,
                        accessCode: res.data.access_code,
                        reference: res.data.reference
                    };
                }
            } catch (err) {
                console.warn('Paystack API unavailable, falling back to local sandbox:', err.message);
            }
        }

        return {
            status: true,
            mode: 'PAYSTACK_SANDBOX',
            message: 'Paystack Sandbox Authorization URL created',
            checkoutUrl: `https://checkout.paystack.com/sandbox-checkout?ref=${reference}&amount=${amount}`,
            reference
        };
    }

    async verifyPayment(reference) {
        if (this.isLiveConfigured()) {
            try {
                const res = await this._request('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
                if (res && res.status && res.data) {
                    return res;
                }
            } catch (err) {
                console.warn('Paystack verify fallback to local sandbox:', err.message);
            }
        }

        return {
            status: true,
            mode: 'PAYSTACK_SANDBOX',
            data: {
                reference,
                status: 'success',
                channel: 'mobile_money',
                currency: 'GHS',
                gateway_response: 'Successful Paystack Sandbox Transaction'
            }
        };
    }
}

module.exports = new PaymentGateway();
