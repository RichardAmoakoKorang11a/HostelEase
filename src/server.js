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

// List all registered students / users
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.all(`SELECT id, student_id, full_name, email, phone, role FROM users ORDER BY student_id ASC`);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List all rooms (Read) - auto-releases expired 15-minute locks
app.get('/api/rooms', async (req, res) => {
    try {
        const now = new Date().toISOString();
        await db.run(
            `UPDATE rooms SET status = 'AVAILABLE', lock_expires_at = NULL 
             WHERE status = 'LOCKED' AND lock_expires_at IS NOT NULL AND lock_expires_at < ?`,
            [now]
        );
        await db.run(
            `UPDATE bookings SET status = 'EXPIRED' 
             WHERE status = 'PENDING' AND room_id IN (
                 SELECT id FROM rooms WHERE status = 'AVAILABLE'
             )`
        );

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
        const numericPrice = parseFloat(price_per_semester);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ error: "Price must be a valid positive number." });
        }
        const numericCapacity = parseInt(capacity) || 1;
        if (numericCapacity <= 0) {
            return res.status(400).json({ error: "Capacity must be at least 1." });
        }
        const validStatuses = ['AVAILABLE', 'LOCKED', 'OCCUPIED'];
        const cleanStatus = validStatuses.includes(status) ? status : 'AVAILABLE';

        const result = await db.run(
            `INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (?, ?, ?, ?, ?)`,
            [hostel_id, room_number.trim(), numericCapacity, numericPrice, cleanStatus]
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
        if (!hostel_id || !room_number || !price_per_semester) {
            return res.status(400).json({ error: "Hostel, room number, and price are required." });
        }
        const numericPrice = parseFloat(price_per_semester);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ error: "Price must be a valid positive number." });
        }
        const numericCapacity = parseInt(capacity) || 1;
        const validStatuses = ['AVAILABLE', 'LOCKED', 'OCCUPIED'];
        const cleanStatus = validStatuses.includes(status) ? status : 'AVAILABLE';

        const result = await db.run(
            `UPDATE rooms SET hostel_id = ?, room_number = ?, capacity = ?, price_per_semester = ?, status = ? WHERE id = ?`,
            [hostel_id, room_number.trim(), numericCapacity, numericPrice, cleanStatus, id]
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: "Room not found." });
        }
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
        const result = await db.run(`DELETE FROM rooms WHERE id = ?`, [id]);
        if (result.changes === 0) {
            return res.status(404).json({ error: "Room not found." });
        }
        res.json({ message: "Room deleted successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reserve bed space (15-min lock)
app.post('/api/bookings/reserve', async (req, res) => {
    try {
        const { userId, roomId } = req.body;
        let targetUserId = userId;
        if (!targetUserId) {
            const firstUser = await db.get("SELECT id FROM users LIMIT 1");
            targetUserId = firstUser ? firstUser.id : 1;
        }
        const result = await bookingService.reserveBedSpace(targetUserId, roomId);
        res.json(result);
    } catch (err) {
        res.status(409).json({ error: err.message });
    }
});

// Paystack sandbox completion endpoint
app.post('/api/bookings/pay-sandbox', async (req, res) => {
    try {
        const { reference } = req.body;
        if (!reference) {
            return res.status(400).json({ error: "Booking reference is required." });
        }
        const result = await bookingService.confirmPayment(reference);
        if (result.status !== 'CONFIRMED') {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// System Health Check & Team Roster
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
                { id: '5240101413', name: 'Richard Amoako Korang', branch: 'main (Project Lead & Integrator)' },
                { id: '5240101414', name: 'Ibrahim Mohammed', branch: 'feature/architecture-uml-ibrahim' },
                { id: '5240101415', name: 'Sandra Otu', branch: 'feature/frontend-ui-sandra' }
            ]
        });
    } catch (err) {
        res.status(500).json({ status: 'UNHEALTHY', error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`HostelEase server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`HostelEase: Port ${PORT} is already in use by an active server instance.`);
    } else {
        console.error("Server runtime error:", err);
    }
});
