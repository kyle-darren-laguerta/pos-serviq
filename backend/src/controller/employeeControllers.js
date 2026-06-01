import db from '../config/db.js';

export const getEmployees = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.employee_id, e.full_name, e.hire_date, e.contact_number, e.overtime_rate, e.role_id, r.role_name
            FROM employee e
            LEFT JOIN Role r ON e.role_id = r.role_id
            ORDER BY e.employee_id ASC
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getEmployeeById = async (req, res) => {
    const id = req.params.id;

    try {
        const [rows] = await db.query(
            `SELECT e.employee_id, e.full_name, e.hire_date, e.contact_number, e.overtime_rate, e.role_id, r.role_name
             FROM employee e
             LEFT JOIN Role r ON e.role_id = r.role_id
             WHERE e.employee_id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getRoles = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT role_id, role_name, wage_per_hour, wage_per_month FROM Role ORDER BY role_name ASC");

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const createRole = async (req, res) => {
    const { role_name, wage_per_hour, wage_per_month } = req.body;

    if (!role_name || wage_per_hour === undefined || wage_per_month === undefined) {
        return res.status(400).json({
            success: false,
            message: 'role_name, wage_per_hour, and wage_per_month are required'
        });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Role (role_name, wage_per_hour, wage_per_month) VALUES (?, ?, ?)',
            [role_name, wage_per_hour, wage_per_month]
        );

        res.status(201).json({
            success: true,
            message: 'Role added successfully',
            data: { role_id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

export const updateRole = async (req, res) => {
    const id = req.params.id;
    const { role_name, wage_per_hour, wage_per_month } = req.body;

    if (!role_name || wage_per_hour === undefined || wage_per_month === undefined) {
        return res.status(400).json({
            success: false,
            message: 'role_name, wage_per_hour, and wage_per_month are required'
        });
    }

    try {
        const [result] = await db.query(
            'UPDATE Role SET role_name = ?, wage_per_hour = ?, wage_per_month = ? WHERE role_id = ?',
            [role_name, wage_per_hour, wage_per_month, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        res.json({
            success: true,
            message: 'Role updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};
export const createEmployee = async (req, res) => {
    const { full_name, hire_date, contact_number, overtime_rate, role_id } = req.body;

    if (!full_name || !hire_date || !contact_number || overtime_rate === undefined || !role_id) {
        return res.status(400).json({
            success: false,
            message: 'full_name, hire_date, contact_number, overtime_rate, and role_id are required'
        });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO employee (full_name, hire_date, contact_number, overtime_rate, role_id) VALUES (?, ?, ?, ?, ?)',
            [full_name, hire_date, contact_number, overtime_rate, role_id]
        );

        res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            data: { employee_id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

export const getAttendance = async (req, res) => {
    const { id, date } = req.query;

    let sql = `
        SELECT a.attendance_id, a.employee_id, e.full_name, a.log_in_time, a.log_out_time, a.total_hour, a.overtime_hour
        FROM attendance a
        JOIN employee e ON e.employee_id = a.employee_id
        WHERE 1=1
    `;
    const params = [];

    if (id) {
        sql += " AND a.employee_id = ?";
        params.push(id);
    }

    if (date) {
        sql += " AND DATE(a.log_in_time) = ?";
        params.push(date);
    }

    sql += " ORDER BY a.log_in_time DESC LIMIT 10";

    try {
        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const punchAttendance = async (req, res) => {
    const { employee_id, type } = req.body;

    if (!employee_id || !type) {
        return res.status(400).json({
            success: false,
            message: "employee_id and type are required"
        });
    }

    try {
        if (type === 'in') {
            const [result] = await db.query(
                'INSERT INTO attendance (employee_id, log_in_time) VALUES (?, NOW())',
                [employee_id]
            );

            return res.status(201).json({
                success: true,
                message: 'Time in recorded',
                attendance_id: result.insertId
            });
        }

        if (type === 'out') {
            const [rows] = await db.query(
                'SELECT attendance_id FROM attendance WHERE employee_id = ? AND log_out_time IS NULL ORDER BY log_in_time DESC LIMIT 1',
                [employee_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active time in record found for this employee'
                });
            }

            const attendanceId = rows[0].attendance_id;
            await db.query(
                `UPDATE attendance
                 SET log_out_time = NOW(),
                     total_hour = TIMESTAMPDIFF(HOUR, log_in_time, NOW()),
                     overtime_hour = GREATEST(TIMESTAMPDIFF(HOUR, log_in_time, NOW()) - 8, 0)
                 WHERE attendance_id = ?`,
                [attendanceId]
            );

            const [updated] = await db.query(
                'SELECT total_hour, overtime_hour FROM attendance WHERE attendance_id = ?',
                [attendanceId]
            );

            return res.status(200).json({
                success: true,
                message: 'Time out recorded',
                attendance_id: attendanceId,
                total_hour: updated[0]?.total_hour ?? null,
                overtime_hour: updated[0]?.overtime_hour ?? null
            });
        }

        return res.status(400).json({
            success: false,
            message: "Invalid type value. Use 'in' or 'out'."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
}

export const getAttendanceReport = async (req, res) => {
    const { startDate, endDate } = req.params;
    let sql = `CALL CalculateExpectedSalaryFullTime(?, ?)`;
    const params = [startDate, endDate];

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ success: false, message: "start_date cannot be after end_date" });
    }

    try {
        const [result] = await db.query(sql, params);

        res.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}