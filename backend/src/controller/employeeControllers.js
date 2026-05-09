import db from '../config/db.js';

export const getEmployees = async (req, res) => {
    const { id } = req.query;
    try {
        const [rows] = await db.query("SELECT * FROM employee");

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
        const [rows] = await db.query("SELECT * FROM employee WHERE employee_id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({
            sucess: true,
            data: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getAttendance = async (req, res) => {
    const { id, date } = req.query;

    let sql = `
        SELECT e.employee_id, e.full_name, a.log_in_time, a.log_out_time
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

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({
            sucess: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
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