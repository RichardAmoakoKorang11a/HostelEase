const BookingService = require('../src/services/bookingService');

/**
 * Unit 7 QA: Automated Concurrency & Booking Verification Suite
 * QA Lead & Test Author: Adjei Douglas (Student ID: 5240101412)
 * Course: Software Engineering - Unit 3 (Requirements) & Unit 7 (Testing & QA)
 */

describe('Unit 7 QA: Concurrency & Booking Verification Suite', () => {
    let mockDb;
    let mockPayment;
    let mockSms;
    let service;

    beforeEach(() => {
        mockDb = {
            rooms: {
                1: { id: 1, room_number: '101', price_per_semester: 1500, status: 'AVAILABLE', lock_expires_at: null }
            },
            bookings: {},
            users: {
                1: { id: 1, full_name: 'Adjei Douglas', phone: '+233240000002', email: '5240101412@campus.edu' },
                2: { id: 2, full_name: 'Osei Sarfo Raphael', phone: '+233240000001', email: '5240101411@campus.edu' }
            },
            async get(sql, params) {
                if (sql.includes('SELECT * FROM rooms WHERE id = ?')) {
                    const roomId = params[0];
                    const room = this.rooms[roomId];
                    if (!room) return null;
                    if (room.status === 'AVAILABLE') return room;
                    if (room.status === 'LOCKED' && room.lock_expires_at) {
                        const nowThreshold = new Date(params[1]);
                        const expires = new Date(room.lock_expires_at);
                        if (expires < nowThreshold) return room;
                    }
                    return null;
                }
                if (sql.includes('SELECT email FROM users WHERE id = ?')) {
                    return this.users[params[0]] || null;
                }
                if (sql.includes('SELECT * FROM bookings WHERE reference = ?')) {
                    return this.bookings[params[0]] || null;
                }
                if (sql.includes('SELECT phone, full_name FROM users WHERE id = ?')) {
                    return this.users[params[0]] || null;
                }
                if (sql.includes('SELECT room_number FROM rooms WHERE id = ?')) {
                    return this.rooms[params[0]] || null;
                }
                return null;
            },
            async run(sql, params) {
                if (sql.includes("UPDATE rooms SET status = 'LOCKED'")) {
                    this.rooms[params[1]].status = 'LOCKED';
                    this.rooms[params[1]].lock_expires_at = params[0];
                    return { changes: 1 };
                }
                if (sql.includes("INSERT INTO bookings")) {
                    const bookingId = Object.keys(this.bookings).length + 1;
                    this.bookings[params[2]] = {
                        id: bookingId,
                        user_id: params[0],
                        room_id: params[1],
                        reference: params[2],
                        status: 'PENDING'
                    };
                    return { lastID: bookingId, changes: 1 };
                }
                if (sql.includes("UPDATE bookings SET status = 'CONFIRMED'")) {
                    const booking = Object.values(this.bookings).find(b => b.id === params[0]);
                    if (booking) booking.status = 'CONFIRMED';
                    return { changes: 1 };
                }
                if (sql.includes("UPDATE rooms SET status = 'OCCUPIED'")) {
                    this.rooms[params[0]].status = 'OCCUPIED';
                    this.rooms[params[0]].lock_expires_at = null;
                    return { changes: 1 };
                }
                return { changes: 0 };
            }
        };

        mockPayment = { initializePayment: jest.fn().mockResolvedValue({ checkoutUrl: 'http://paystack.sandbox' }) };
        mockSms = { sendSMS: jest.fn().mockResolvedValue({ success: true }) };
        service = new BookingService(mockDb, mockPayment, mockSms);
    });

    test('TC-01: First student acquires the 15-minute bed lock', async () => {
        const result = await service.reserveBedSpace(1, 1);
        expect(result.bookingId).toBe(1);
        expect(result.reference).toContain('HE-');
    });

    test('TC-02: Simultaneous double-booking attempt is rejected (Concurrency Lock)', async () => {
        await service.reserveBedSpace(1, 1);
        await expect(service.reserveBedSpace(2, 1)).rejects.toThrow("ERR_ROOM_UNAVAILABLE");
    });

    test('TC-03: Paystack payment confirmation transitions status to CONFIRMED and sends SMS', async () => {
        const reservation = await service.reserveBedSpace(1, 1);
        await service.confirmPayment(reservation.reference);
        expect(mockSms.sendSMS).toHaveBeenCalled();
        expect(mockDb.rooms[1].status).toBe('OCCUPIED');
    });

    test('TC-04: Expired 15-minute lock allows subsequent student to acquire room', async () => {
        await service.reserveBedSpace(1, 1);
        mockDb.rooms[1].lock_expires_at = new Date(Date.now() - 60000).toISOString();
        const secondAttempt = await service.reserveBedSpace(2, 1);
        expect(secondAttempt.bookingId).toBe(2);
    });

    test('TC-05: Non-existent room reservation attempt throws ERR_ROOM_UNAVAILABLE', async () => {
        await expect(service.reserveBedSpace(1, 999)).rejects.toThrow("ERR_ROOM_UNAVAILABLE");
    });
});
