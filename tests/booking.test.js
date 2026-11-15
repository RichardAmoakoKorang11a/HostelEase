const BookingService = require('../src/services/bookingService');

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
            async get(sql, params) {
                const roomId = params[0];
                const room = this.rooms[roomId];
                if (room && room.status === 'AVAILABLE') return room;
                return null;
            },
            async run(sql, params) {
                if (sql.includes("UPDATE rooms SET status = 'LOCKED'")) {
                    this.rooms[params[1]].status = 'LOCKED';
                    return { changes: 1 };
                }
                if (sql.includes("INSERT INTO bookings")) {
                    return { lastID: 1 };
                }
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
});

