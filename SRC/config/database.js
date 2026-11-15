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

    // Ensure Hostels exist
    db.get("SELECT COUNT(*) as count FROM hostels", (err, row) => {
        if (!err && (!row || row.count === 0)) {
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Akuafo Hall', 'Main Campus', 'MIXED')");
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Commonwealth Hall', 'Upper Hill', 'MALE')");
            db.run("INSERT INTO hostels (name, campus_location, gender_type) VALUES ('Volta Hall', 'Lower Campus', 'FEMALE')");

            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (1, 'Room 101', 1, 1500.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (1, 'Room 102', 1, 1500.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (2, 'Room 205', 1, 1800.00, 'AVAILABLE')");
            db.run("INSERT INTO rooms (hostel_id, room_number, capacity, price_per_semester, status) VALUES (3, 'Room 312', 1, 1600.00, 'AVAILABLE')");
        }
    });

    // Remove old placeholder user if exists
    db.run("DELETE FROM users WHERE student_id = '10928374'");

    // Seed all 5 Group 2 members
    const group2Members = [
        ['5240101411', 'Osei Sarfo Raphael', '5240101411@campus.edu', '+233240000001', 'STUDENT'],
        ['5240101412', 'Adjei Douglas', '5240101412@campus.edu', '+233240000002', 'STUDENT'],
        ['5240101413', 'Richard Amoako Korang', 'Ramoako300@gmail.com', '+233240000003', 'LEAD_DEV'],
        ['5240101414', 'Ibrahim Mohammed', '5240101414@campus.edu', '+233240000004', 'STUDENT'],
        ['5240101415', 'Sandra Otu', '5240101415@campus.edu', '+233240000005', 'STUDENT']
    ];

    group2Members.forEach(([id, name, email, phone, role]) => {
        db.run(
            `INSERT INTO users (student_id, full_name, email, phone, role) 
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(student_id) DO UPDATE SET full_name = excluded.full_name, email = excluded.email`,
            [id, name, email, phone, role]
        );
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
