const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const paymentGateway = require('./services/paymentGateway');
const smsService = require('./services/smsService');
const BookingService = require('./services/bookingService');

const app = express();
const bookingService = new BookingService(db, paymentGateway, smsService);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// List all rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await db.all(`
            SELECT r.*, h.name as hostel_name, h.gender_type, h.campus_location
            FROM rooms r
            JOIN hostels h ON r.hostel_id = h.id
        `);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reserve bed space (15-min lock)
app.post('/api/bookings/reserve', async (req, res) => {
    try {
        const { userId, roomId } = req.body;
        const result = await bookingService.reserveBedSpace(userId || 1, roomId);
        res.json(result);
    } catch (err) {
        res.status(409).json({ error: err.message });
    }
});

// Paystack sandbox completion endpoint
app.post('/api/bookings/pay-sandbox', async (req, res) => {
    try {
        const { reference } = req.body;
        const result = await bookingService.confirmPayment(reference);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HostelEase server running at http://localhost:${PORT}`);
});

