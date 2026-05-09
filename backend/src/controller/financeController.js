import db from '../config/db.js';

export const getRevenue = async (reg, res) => {
    let sql = `
        SELECT SUM(amount) AS monthly_revenue
        FROM receipt
        WHERE date BETWEEN DATE_SUB(CURDATE(), INTERVAL 22 DAY) AND CURDATE()
    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is no revenue" });
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