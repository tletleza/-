/**
 * Express REST API for Thai Traditional Medicine Booking System
 * Target DBMS: MySQL (mysql2/promise)
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection Pool Configuration
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ttm_clinic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =========================================================================
// ENDPOINT 1: GET /api/schedules
// Fetch available doctors and slots based on patient's selected symptom_id
// =========================================================================
app.get('/api/schedules', async (req, res) => {
    try {
        const { symptom_id, work_date } = req.query;

        if (!symptom_id) {
            return res.status(400).json({ success: false, message: 'symptom_id query parameter is required' });
        }

        const targetDate = work_date || new Date().toISOString().split('T')[0];

        // 1. Fetch symptom & specialty info
        const [symptoms] = await dbPool.query(
            `SELECT s.symptom_id, s.symptom_name, s.specialty_id, spec.specialty_name
             FROM symptoms s
             LEFT JOIN specialties spec ON s.specialty_id = spec.specialty_id
             WHERE s.symptom_id = ?`,
            [symptom_id]
        );

        if (symptoms.length === 0) {
            return res.status(404).json({ success: false, message: 'Symptom not found' });
        }

        const symptomInfo = symptoms[0];

        // 2. Fetch matching available staff schedules
        const [schedules] = await dbPool.query(
            `SELECT 
                st.staff_id, st.first_name, st.last_name, st.phone, st.role, st.profile_image,
                sp.specialty_name,
                sch.schedule_id, sch.work_date, sch.start_time, sch.end_time, sch.status AS schedule_status
             FROM staff st
             JOIN schedules sch ON st.staff_id = sch.staff_id
             LEFT JOIN specialties sp ON st.specialty_id = sp.specialty_id
             WHERE (st.specialty_id = ? OR ? IS NULL)
               AND sch.work_date = ?
               AND sch.status = 'available'
             ORDER BY sch.start_time ASC`,
            [symptomInfo.specialty_id, symptomInfo.specialty_id, targetDate]
        );

        // 3. Attach booked times per staff to filter available slots
        for (let row of schedules) {
            const [bookings] = await dbPool.query(
                `SELECT booking_time FROM bookings WHERE staff_id = ? AND booking_date = ? AND status IN ('pending', 'confirmed')`,
                [row.staff_id, targetDate]
            );
            row.existing_booked_times = bookings.map(b => b.booking_time);
        }

        return res.json({
            success: true,
            symptom: symptomInfo,
            query: { symptom_id, work_date: targetDate },
            data: schedules
        });

    } catch (error) {
        console.error('GET /api/schedules Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================================================
// ENDPOINT 2: POST /api/bookings
// Create a new booking record
// =========================================================================
app.post('/api/bookings', async (req, res) => {
    const connection = await dbPool.getConnection();
    try {
        const { user_id, staff_id, service_id, booking_date, booking_time, total_price } = req.body;

        if (!user_id || !staff_id || !service_id || !booking_date || !booking_time) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, staff_id, service_id, booking_date, booking_time'
            });
        }

        await connection.beginTransaction();

        // 1. Check double booking collision
        const [existing] = await connection.query(
            `SELECT booking_id FROM bookings 
             WHERE staff_id = ? AND booking_date = ? AND booking_time = ? AND status IN ('pending', 'confirmed')
             FOR UPDATE`,
            [staff_id, booking_date, booking_time]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'Selected doctor/time slot is already booked.' });
        }

        // 2. Determine price if not passed
        let finalPrice = total_price;
        if (!finalPrice || finalPrice <= 0) {
            const [srv] = await connection.query(`SELECT price FROM services WHERE service_id = ?`, [service_id]);
            if (srv.length > 0) finalPrice = srv[0].price;
        }

        // 3. Insert into bookings
        const [result] = await connection.query(
            `INSERT INTO bookings (user_id, staff_id, service_id, booking_date, booking_time, status, total_price)
             VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
            [user_id, staff_id, service_id, booking_date, booking_time, finalPrice]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                booking_id: result.insertId,
                user_id, staff_id, service_id, booking_date, booking_time, status: 'pending', total_price: finalPrice
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('POST /api/bookings Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// =========================================================================
// ENDPOINT 3: PUT /api/bookings/:id/status
// Admin updates booking status. If status = 'completed' AND staff role = 'intern',
// trigger auto insert into 'intern_hours_log'.
// =========================================================================
app.put('/api/bookings/:id/status', async (req, res) => {
    const connection = await dbPool.getConnection();
    try {
        const booking_id = req.params.id;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!booking_id || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID or status. Status must be: pending, confirmed, completed, or cancelled.'
            });
        }

        await connection.beginTransaction();

        // 1. Fetch booking details with staff role & service duration
        const [rows] = await connection.query(
            `SELECT b.booking_id, b.staff_id, b.service_id, b.status AS current_status,
                    st.role AS staff_role, srv.duration_minutes
             FROM bookings b
             JOIN staff st ON b.staff_id = st.staff_id
             JOIN services srv ON b.service_id = srv.service_id
             WHERE b.booking_id = ? FOR UPDATE`,
            [booking_id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = rows[0];

        // 2. Update booking status
        await connection.query(
            `UPDATE bookings SET status = ? WHERE booking_id = ?`,
            [status, booking_id]
        );

        let intern_hours_logged = false;
        let hours_earned = 0.00;

        // 3. Automated trigger check for intern hour logging
        if (status === 'completed' && booking.staff_role.toLowerCase() === 'intern') {
            const [logCheck] = await connection.query(
                `SELECT log_id FROM intern_hours_log WHERE booking_id = ?`,
                [booking_id]
            );

            if (logCheck.length === 0) {
                const durationMins = booking.duration_minutes || 60;
                hours_earned = Number((durationMins / 60.0).toFixed(2));

                await connection.query(
                    `INSERT INTO intern_hours_log (staff_id, booking_id, hours_earned, date_logged)
                     VALUES (?, ?, ?, CURDATE())`,
                    [booking.staff_id, booking_id, hours_earned]
                );

                intern_hours_logged = true;
            }
        }

        await connection.commit();

        return res.json({
            success: true,
            message: `Booking status updated to '${status}' successfully`,
            data: {
                booking_id: Number(booking_id),
                previous_status: booking.current_status,
                new_status: status,
                staff_id: booking.staff_id,
                staff_role: booking.staff_role,
                intern_hours_logged,
                hours_earned
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('PUT /api/bookings/:id/status Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Thai Traditional Medicine API Server running on port ${PORT}`);
});
