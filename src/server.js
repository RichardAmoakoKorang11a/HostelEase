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
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// List all hostels
app.get('/api/hostels', async (req, res) => {
    try {
        const hostels = await db.all(`SELECT * FROM hostels ORDER BY name ASC`);
        res.json(hostels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List all rooms (Read)
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await db.all(`
            SELECT r.*, h.name as hostel_name, h.gender_type, h.campus_location
            FROM rooms r
            JOIN hostels h ON r.hostel_id = h.id
            ORDER BY r.id DESC
        `);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new room (Create)
app.post('/api/rooms', async (req, res) => {
    try {
        const { hostel_id, room_number, capacity, price_per_semester, status } = req.body;
        if (!hostel_id || !room_number || !price_per_semester) {
            return res.status(400).json({ error: "Hostel, room number, and price are required." });
        }
        const result = await db.run(
            `INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (?, ?, ?, ?, ?)`,
            [hostel_id, room_number, capacity || 1, price_per_semester, status || 'AVAILABLE']
        );
        res.status(201).json({ id: result.lastID, message: "Room created successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit an existing room (Update)
app.put('/api/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { hostel_id, room_number, capacity, price_per_semester, status } = req.body;
        await db.run(
            `UPDATE rooms SET hostel_id = ?, room_number = ?, capacity = ?, price_per_semester = ?, status = ? WHERE id = ?`,
            [hostel_id, room_number, capacity, price_per_semester, status, id]
        );
        res.json({ message: "Room updated successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a room (Delete)
app.delete('/api/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run(`DELETE FROM bookings WHERE room_id = ?`, [id]);
        await db.run(`DELETE FROM rooms WHERE id = ?`, [id]);
        res.json({ message: "Room deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reserve bed space (15-min lock)
app.post('/api/bookings/reserve', async (req, res) => {
    try {
        const { userId, roomId } = req.body;
        const result = await bookingService.reserveBedSpace(userId || 3, roomId);
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

// System Health Check & Team Roster (Richard Amoako Korang - Student ID: 5240101413 - Unit 1, 2 & 6)
app.get('/api/health', async (req, res) => {
    try {
        const dbHealthy = await db.healthCheck();
        res.json({
            status: 'HEALTHY',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'CONNECTED' : 'DISCONNECTED',
            project: 'HostelEase',
            group: 'Group 2',
            members: [
                { id: '5240101411', name: 'Osei Sarfo Raphael', branch: 'feature/database-seeding-raphael' },
                { id: '5240101412', name: 'Adjei Douglas', branch: 'feature/srs-qa-testing-douglas' },
                { id: '5240101413', name: 'Richard Amoako Korang', branch: 'feature/booking-engine-richard' },
                { id: '5240101414', name: 'Ibrahim Mohammed', branch: 'feature/architecture-uml-ibrahim' },
                { id: '5240101415', name: 'Sandra Otu', branch: 'feature/frontend-ui-sandra' }
            ]
        });
    } catch (err) {
        res.status(500).json({ status: 'UNHEALTHY', error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`HostelEase server running at http://localhost:${PORT}`);
});
