import db from '../config/db.js';

export const getRevenue = async (req, res) => {
    const { startDate, endDate } = req.params;
    let sql = `CALL GetRevenueByInterval(?, ?)`;
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

// GetExpensesByInterval is not working yet
export const getExpenses = async (req, res) => {
    const { startDate, endDate } = req.params;
    let sql = `CALL CalculateTotalWasteCost(?, ?)`;
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

export const getPartTimeSalaryReport = async (req, res) => {
    const { startDate, endDate } = req.params;
    const sql = `CALL CalculateExpectedSalaryPartTime(?, ?)`;
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
            data: result[0] || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const getMonthlyItemSold = async (req, res) => {
    const { startDate, endDate } = req.params;
    const sql = `CALL GetMonthlyItemSold(?, ?)`;
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
            data: result[0] || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}