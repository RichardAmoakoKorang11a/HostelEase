const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../hostelease.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    const schemaPath = path.resolve(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql, (err) => {
            if (err) console.error("Database schema init error:", err);
        });
    }

    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (!err && (!row || row.count === 0)) {
            // Seed Hostels
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Akuafo Hall', 'Main Campus', 'MIXED')");
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Commonwealth Hall', 'Upper Hill', 'MALE')");
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Volta Hall', 'Lower Campus', 'FEMALE')");

            // Seed Rooms
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (1, 'Room 101', 1, 1500.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (1, 'Room 102', 1, 1500.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (2, 'Room 205', 1, 1800.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (3, 'Room 312', 1, 1600.00, 'AVAILABLE')");

            // Seed Group 2 Team Members
            db.run("INSERT INTO users (student_id, full_name, email, phone) VALUES ('5240101411', 'Osei Sarfo Raphael', 'raphael@campus.edu', '+233240000001')");
            db.run("INSERT INTO users (student_id, full_name, email, phone) VALUES ('5240101412', 'Adjei Douglas', 'douglas@campus.edu', '+233240000002')");
            db.run("INSERT INTO users (student_id, full_name, email, phone) VALUES ('5240101413', 'Richard Amoako Korang', 'richard@campus.edu', '+233240000003')");
            db.run("INSERT INTO users (student_id, full_name, email, phone) VALUES ('5240101414', 'Ibrahim Mohammed', 'ibrahim@campus.edu', '+233240000004')");
            db.run("INSERT INTO users (student_id, full_name, email, phone) VALUES ('5240101415', 'Sandra Otu', 'sandra@campus.edu', '+233240000005')");
        }
    });
});

module.exports = {
    get: (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) { err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }); });
    })
};
