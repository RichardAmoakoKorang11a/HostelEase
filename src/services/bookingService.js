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

        // Initialize sandbox payment link
        const user = await this.db.get(`SELECT email FROM users WHERE id = ?`, [userId]);
        const paymentData = await this.payment.initializePayment({
            reference,
            amount: room.price_per_semester,
            email: user ? user.email : 'student@campus.edu'
        });

        return {
            bookingId: booking.lastID,
            reference,
            lockExpiresAt,
            paymentUrl: paymentData.checkoutUrl
        };
    }

    async confirmPayment(reference) {
        const booking = await this.db.get(`SELECT * FROM bookings WHERE reference = ?`, [reference]);
        if (!booking || booking.status === 'CONFIRMED') {
            return { status: 'ALREADY_PROCESSED_OR_INVALID' };
        }

        // Finalize booking & mark room occupied
        await this.db.run(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?`, [booking.id]);
        await this.db.run(`UPDATE rooms SET status = 'OCCUPIED', lock_expires_at = NULL WHERE id = ?`, [booking.room_id]);

        // Send SMS confirmation ticket
        const user = await this.db.get(`SELECT phone, full_name FROM users WHERE id = ?`, [booking.user_id]);
        const room = await this.db.get(`SELECT room_number FROM rooms WHERE id = ?`, [booking.room_id]);

        await this.sms.sendSMS(
            user ? user.phone : '+233240000001',
            `HostelEase: Hello ${user ? user.full_name : 'Student'}, your booking #${reference} for ${room ? room.room_number : 'Room'} is CONFIRMED. Present this SMS at the hall porter's desk.`
        );

        return { status: 'CONFIRMED', reference };
    }
}

module.exports = BookingService;

