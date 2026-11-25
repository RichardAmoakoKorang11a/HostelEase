const https = require('https');
const tls = require('tls');

/**
 * Email Notification Service
 * Supports Gmail/SMTP over TLS (port 465), Resend HTTPS API, and automatic offline sandbox fallback.
 */
class EmailService {
    isResendConfigured() {
        const key = process.env.RESEND_API_KEY || '';
        return Boolean(key && key.startsWith('re_') && !key.includes('mock'));
    }

    isSmtpConfigured() {
        const user = process.env.SMTP_USER || '';
        const pass = process.env.SMTP_PASS || '';
        return Boolean(user && pass && !pass.includes('mock'));
    }

    _sendViaResend({ to, subject, html, text }) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({
                from: process.env.EMAIL_FROM || 'HostelEase <onboarding@resend.dev>',
                to: [to],
                subject,
                html,
                text
            });

            const req = https.request({
                hostname: 'api.resend.com',
                path: '/emails',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
                            resolve({ success: true, mode: 'RESEND_LIVE', messageId: data.id });
                        } else {
                            reject(new Error(data.message || `Resend HTTP ${res.statusCode}`));
                        }
                    } catch (e) {
                        reject(new Error('Invalid Resend API response'));
                    }
                });
            });

            req.on('timeout', () => { req.destroy(); reject(new Error('Resend API timed out')); });
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
    }

    _sendViaSmtp({ to, subject, text }) {
        return new Promise((resolve, reject) => {
            const host = process.env.SMTP_HOST || 'smtp.gmail.com';
            const port = parseInt(process.env.SMTP_PORT || '465', 10);
            const user = process.env.SMTP_USER;
            const pass = process.env.SMTP_PASS;

            const socket = tls.connect({ host, port, servername: host, timeout: 10000 });
            let step = 0;
            let buffer = '';

            const sendLine = (line) => socket.write(`${line}\r\n`);

            socket.on('data', (chunk) => {
                buffer += chunk.toString();
                if (!buffer.endsWith('\n')) return;
                const lines = buffer.trim().split('\r\n');
                const lastLine = lines[lines.length - 1];
                if (/^\d{3}-/.test(lastLine)) return; // multi-line response
                const code = parseInt(lastLine.slice(0, 3), 10);
                buffer = '';

                if (code >= 400) {
                    socket.end();
                    return reject(new Error(`SMTP Error (${code}): ${lastLine}`));
                }

                if (step === 0 && code === 220) {
                    step = 1;
                    sendLine('EHLO hostelease.local');
                } else if (step === 1 && code === 250) {
                    step = 2;
                    sendLine('AUTH LOGIN');
                } else if (step === 2 && code === 334) {
                    step = 3;
                    sendLine(Buffer.from(user).toString('base64'));
                } else if (step === 3 && code === 334) {
                    step = 4;
                    sendLine(Buffer.from(pass).toString('base64'));
                } else if (step === 4 && code === 235) {
                    step = 5;
                    sendLine(`MAIL FROM:<${user}>`);
                } else if (step === 5 && code === 250) {
                    step = 6;
                    sendLine(`RCPT TO:<${to}>`);
                } else if (step === 6 && code === 250) {
                    step = 7;
                    sendLine('DATA');
                } else if (step === 7 && code === 354) {
                    step = 8;
                    const emailBody = [
                        `From: "HostelEase" <${user}>`,
                        `To: <${to}>`,
                        `Subject: ${subject}`,
                        `MIME-Version: 1.0`,
                        `Content-Type: text/plain; charset=UTF-8`,
                        ``,
                        text,
                        `.`
                    ].join('\r\n');
                    socket.write(`${emailBody}\r\n`);
                } else if (step === 8 && code === 250) {
                    step = 9;
                    sendLine('QUIT');
                    socket.end();
                    resolve({ success: true, mode: 'SMTP_LIVE', messageId: `SMTP_${Date.now()}` });
                }
            });

            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('SMTP connection timed out'));
            });
            socket.on('error', reject);
        });
    }

    async sendEmail({ to, subject, text, html }) {
        if (this.isResendConfigured()) {
            try {
                return await this._sendViaResend({ to, subject, text, html: html || `<pre>${text}</pre>` });
            } catch (err) {
                console.warn('Resend email failed, falling back to sandbox:', err.message);
            }
        }

        if (this.isSmtpConfigured()) {
            try {
                return await this._sendViaSmtp({ to, subject, text });
            } catch (err) {
                console.warn('SMTP email failed, falling back to sandbox:', err.message);
            }
        }

        console.log(`\n========================================`);
        console.log(`[EMAIL SANDBOX GATEWAY DISPATCH]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${text}`);
        console.log(`========================================\n`);

        return {
            success: true,
            mode: 'EMAIL_SANDBOX',
            messageId: `EM_SANDBOX_${Date.now()}`
        };
    }
}

module.exports = new EmailService();
