const https = require('https');

/**
 * SMS Notification Service
 * Supports Twilio REST API, Arkesel Ghana SMS API, and automatic offline sandbox fallback.
 */
class SMSService {
    constructor() {
        this.logs = [];
    }

    _recordLog(entry) {
        this.logs.unshift({ ...entry, timestamp: new Date().toISOString() });
        if (this.logs.length > 50) this.logs.pop();
    }

    getLogs() {
        return this.logs;
    }

    isTwilioConfigured() {
        const sid = process.env.TWILIO_ACCOUNT_SID || '';
        const token = process.env.TWILIO_AUTH_TOKEN || '';
        const from = process.env.TWILIO_PHONE_NUMBER || '';
        return Boolean(sid.startsWith('AC') && !sid.includes('mock') && token && !token.includes('mock') && from);
    }

    isArkeselConfigured() {
        const key = process.env.ARKESEL_API_KEY || '';
        return Boolean(key && !key.includes('mock'));
    }

    _sendViaTwilio(to, body) {
        return new Promise((resolve, reject) => {
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const token = process.env.TWILIO_AUTH_TOKEN;
            const from = process.env.TWILIO_PHONE_NUMBER;
            const form = new URLSearchParams({ To: to, From: from, Body: body }).toString();
            const auth = Buffer.from(`${sid}:${token}`).toString('base64');

            const req = https.request({
                hostname: 'api.twilio.com',
                path: `/2010-04-01/Accounts/${sid}/Messages.json`,
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(form)
                },
                timeout: 8000
            }, (res) => {
                let raw = '';
                res.on('data', (c) => { raw += c; });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(raw || '{}');
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ success: true, mode: 'TWILIO_LIVE', messageId: data.sid });
                        } else {
                            reject(new Error(data.message || `Twilio HTTP ${res.statusCode}`));
                        }
                    } catch (e) {
                        reject(new Error('Invalid Twilio API response'));
                    }
                });
            });

            req.on('timeout', () => { req.destroy(); reject(new Error('Twilio request timed out')); });
            req.on('error', reject);
            req.write(form);
            req.end();
        });
    }

    _sendViaArkesel(to, message) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({
                sender: process.env.ARKESEL_SENDER_ID || 'HostelEase',
                message,
                recipients: [to.replace(/^\+/, '')]
            });

            const req = https.request({
                hostname: 'sms.arkesel.com',
                path: '/api/v2/sms/send',
                method: 'POST',
                headers: {
                    'api-key': process.env.ARKESEL_API_KEY,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                },
                timeout: 8000
            }, (res) => {
                let raw = '';
                res.on('data', (c) => { raw += c; });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(raw || '{}');
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ success: true, mode: 'ARKESEL_LIVE', messageId: `ARK_${Date.now()}` });
                        } else {
                            reject(new Error(data.message || `Arkesel HTTP ${res.statusCode}`));
                        }
                    } catch (e) {
                        reject(new Error('Invalid Arkesel API response'));
                    }
                });
            });

            req.on('timeout', () => { req.destroy(); reject(new Error('Arkesel request timed out')); });
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
    }

    async sendSMS(phoneNumber, message) {
        if (this.isArkeselConfigured()) {
            try {
                const res = await this._sendViaArkesel(phoneNumber, message);
                this._recordLog({ type: 'SMS', to: phoneNumber, subject: 'SMS Alert', summary: message, mode: res.mode });
                return res;
            } catch (err) {
                console.warn('Arkesel SMS failed, falling back to sandbox:', err.message);
            }
        }

        if (this.isTwilioConfigured()) {
            try {
                const res = await this._sendViaTwilio(phoneNumber, message);
                this._recordLog({ type: 'SMS', to: phoneNumber, subject: 'SMS Alert', summary: message, mode: res.mode });
                return res;
            } catch (err) {
                console.warn('Twilio SMS failed, falling back to sandbox:', err.message);
            }
        }

        console.log(`\n========================================`);
        console.log(`[SMS SANDBOX GATEWAY DISPATCH]`);
        console.log(`To: ${phoneNumber}`);
        console.log(`Message: ${message}`);
        console.log(`========================================\n`);

        const sandboxRes = {
            success: true,
            mode: 'SMS_SANDBOX',
            messageId: `SM_SANDBOX_${Date.now()}`
        };
        this._recordLog({ type: 'SMS', to: phoneNumber, subject: 'SMS Alert', summary: message, mode: sandboxRes.mode });
        return sandboxRes;
    }
}

module.exports = new SMSService();
