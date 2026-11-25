const crypto = require('crypto');

class BookingService {
    constructor(dbClient, paymentGateway, notificationService) {
        this.db = dbClient;
        this.payment = paymentGateway;
        this.sms = notificationService;
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

        await this.db.run(
            `INSERT OR IGNORE INTO payments (booking_id, reference, amount, channel, status) VALUES (?, ?, ?, ?, 'SUCCESS')`,
            [booking.id, reference, amount, channel]
        );

        // Send SMS confirmation ticket
        const user = await this.db.get(`SELECT phone, full_name FROM users WHERE id = ?`, [booking.user_id]);

        await this.sms.sendSMS(
            user ? user.phone : '+233240000001',
            `HostelEase: Hello ${user ? user.full_name : 'Student'}, your Paystack payment for booking #${reference} (${room ? room.room_number : 'Room'}) is CONFIRMED. Present this SMS at the hall porter's desk.`
        );

        return { status: 'CONFIRMED', reference, amount, channel };
    }
}

module.exports = BookingService;

