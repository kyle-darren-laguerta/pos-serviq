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
        const [rows] = await db.query("SELECT role_id, role_name FROM Role ORDER BY role_name ASC");

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
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
        SELECT a.attendance_id, a.employee_id, e.full_name, a.log_in_time, a.log_out_time
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
                'UPDATE attendance SET log_out_time = NOW() WHERE attendance_id = ?',
                [attendanceId]
            );

            return res.status(200).json({
                success: true,
                message: 'Time out recorded',
                attendance_id: attendanceId
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

export const getEmployeeSalary = async (req, res) => {
    let sql = `
        SELECT e.employee_id, e.full_name, ft.monthly_salary AS base_salary, (ft.monthly_salary / 22) * COUNT(a.attendance_id) AS prorated_salary, (22 - COUNT(a.attendance_id)) AS total_absences
        FROM employee AS e
        JOIN full_time AS ft ON e.employee_id = ft.employee_id
        LEFT JOIN attendance AS a ON e.employee_id = a.employee_id
        GROUP BY e.employee_id, e.full_name, ft.monthly_salary;

    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        res.json({
            sucess: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}