const crypto = require('crypto');

class BookingService {
    constructor(dbClient, paymentGateway, notificationService, emailService = null) {
        this.db = dbClient;
        this.payment = paymentGateway;
        this.sms = notificationService;
        this.email = emailService;
    }

    async reserveBedSpace(userId, roomId) {
        const lockWindowMinutes = 15;
        const now = new Date();
        const lockExpiresAt = new Date(now.getTime() + lockWindowMinutes * 60000);

        // Atomic check: room must be AVAILABLE or have an expired lock
        const room = await this.db.get(
            `SELECT * FROM rooms WHERE id = ? AND (status = 'AVAILABLE' OR (status = 'LOCKED' AND lock_expires_at < ?))`,
            [roomId, now.toISOString()]
        );

        if (!room) {
            throw new Error("ERR_ROOM_UNAVAILABLE: Room is already locked or occupied.");
        }

        // Apply 15-minute lock
        await this.db.run(
            `UPDATE rooms SET status = 'LOCKED', lock_expires_at = ? WHERE id = ?`,
            [lockExpiresAt.toISOString(), roomId]
        );

        // Generate reservation reference
        const reference = `HE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const booking = await this.db.run(
            `INSERT INTO bookings (user_id, room_id, reference, status) VALUES (?, ?, ?, 'PENDING')`,
            [userId, roomId, reference]
        );

        // Initialize Paystack payment link
        const user = await this.db.get(`SELECT email FROM users WHERE id = ?`, [userId]);
        const studentEmail = user ? user.email : 'student@campus.edu';
        const paymentData = await this.payment.initializePayment({
            reference,
            amount: room.price_per_semester,
            email: studentEmail
        });

        // Notify Admin on new reservation transaction (live server mode)
        if (this.email) {
            const adminEmail = process.env.ADMIN_EMAIL || 'ramoako300@gmail.com';
            const adminPhones = [process.env.ADMIN_PHONE || '+233551430412', process.env.ADMIN_PHONE_ALT].filter(Boolean);
            this.email.sendEmail({
                to: adminEmail,
                subject: `[HostelEase Admin Alert] New Room Reservation Pending (#${reference})`,
                text: `New transaction initiated:\nReference: ${reference}\nRoom: ${room.room_number}\nAmount: GHS ${room.price_per_semester}\nStudent Email: ${studentEmail}\nStatus: LOCKED (15-min window)`
            }).catch((e) => console.warn('Admin reservation email error:', e.message));

            for (const phone of [...new Set(adminPhones)]) {
                this.sms.sendSMS(
                    phone,
                    `HostelEase ADMIN: New reservation #${reference} started for ${room.room_number} (GHS ${room.price_per_semester}) by ${studentEmail}.`
                ).catch((e) => console.warn('Admin reservation SMS error:', e.message));
            }
        }

        return {
            bookingId: booking.lastID,
            reference,
            amount: room.price_per_semester,
            email: studentEmail,
            lockExpiresAt,
            paymentMode: paymentData.mode || 'PAYSTACK_SANDBOX',
            paymentUrl: paymentData.checkoutUrl
        };
    }

    async confirmPayment(reference, channel = 'MOBILE_MONEY') {
        const booking = await this.db.get(`SELECT * FROM bookings WHERE reference = ?`, [reference]);
        if (!booking || booking.status === 'CONFIRMED') {
            return { status: 'ALREADY_PROCESSED_OR_INVALID' };
        }

        if (typeof this.payment.verifyPayment === 'function') {
            const verification = await this.payment.verifyPayment(reference);
            if (!verification || !verification.status || !verification.data || verification.data.status !== 'success') {
                return { status: 'PAYMENT_VERIFICATION_FAILED' };
            }
        }

        // Finalize booking & mark room occupied
        await this.db.run(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?`, [booking.id]);
        await this.db.run(`UPDATE rooms SET status = 'OCCUPIED', lock_expires_at = NULL WHERE id = ?`, [booking.room_id]);

        const room = await this.db.get(`SELECT room_number, price_per_semester FROM rooms WHERE id = ?`, [booking.room_id]);
        const amount = room && room.price_per_semester ? room.price_per_semester : 0;
        const roomLabel = room ? room.room_number : 'Room';

        await this.db.run(
            `INSERT OR IGNORE INTO payments (booking_id, reference, amount, channel, status) VALUES (?, ?, ?, ?, 'SUCCESS')`,
            [booking.id, reference, amount, channel]
        );

        // Fetch student info for notifications
        const user = await this.db.get(`SELECT phone, full_name, email FROM users WHERE id = ?`, [booking.user_id]);
        const studentName = user ? user.full_name : 'Student';
        const studentPhone = user ? user.phone : '+233240000001';
        const studentEmail = user ? user.email : 'student@campus.edu';

        // Dispatch Student & Admin notifications in parallel for fast response
        const smsMsg = `HostelEase: Hello ${studentName}, your Paystack payment for booking #${reference} (${roomLabel}) is CONFIRMED. Present this SMS at the hall porter's desk.`;

        let studentEmailResult = null;
        let adminEmailResult = null;
        let adminSmsResult = null;

        if (!this.email) {
            const studentSms = await this.sms.sendSMS(studentPhone, smsMsg);
            return {
                status: 'CONFIRMED',
                reference,
                amount,
                channel,
                notifications: { studentSms, studentEmail: null, adminSms: null, adminEmail: null }
            };
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'ramoako300@gmail.com';
        const adminPhones = [...new Set([process.env.ADMIN_PHONE || '+233551430412', process.env.ADMIN_PHONE_ALT].filter(Boolean))];
        const adminMsg = `HostelEase ADMIN ALERT: GHS ${amount} paid via Paystack (${channel}) by ${studentName} for ${roomLabel}. Ref: #${reference}.`;

        const [studentSms, sEmail, aEmail, ...aSmsList] = await Promise.all([
            this.sms.sendSMS(studentPhone, smsMsg),
            this.email.sendEmail({
                to: studentEmail,
                subject: `HostelEase Receipt: Booking #${reference} Confirmed`,
                text: `Hello ${studentName},\n\nYour Paystack payment of GHS ${amount} (${channel}) for ${roomLabel} has been confirmed.\nBooking Reference: ${reference}\n\nPresent this confirmation at the hall porter's desk.`
            }),
            this.email.sendEmail({
                to: adminEmail,
                subject: `[HostelEase Admin Alert] Payment Received - GHS ${amount} (#${reference})`,
                text: `HostelEase Transaction Notification\n\nStatus: CONFIRMED\nReference: ${reference}\nAmount: GHS ${amount}\nChannel: ${channel}\nRoom: ${roomLabel}\nStudent: ${studentName} (${studentEmail}, ${studentPhone})\nTime: ${new Date().toISOString()}`
            }),
            ...adminPhones.map((phone) => this.sms.sendSMS(phone, adminMsg))
        ]);

        studentEmailResult = sEmail;
        adminEmailResult = aEmail;
        adminSmsResult = aSmsList[0] || null;

        return {
            status: 'CONFIRMED',
            reference,
            amount,
            channel,
            notifications: {
                studentSms,
                studentEmail: studentEmailResult,
                adminSms: adminSmsResult,
                adminEmail: adminEmailResult
            }
        };
    }
}

module.exports = BookingService;

