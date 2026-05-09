import db from '../config/db.js';

export const getMenu = async (req, res) => {
    let sql = `
        SELECT menu_item_id, name, price, availability_status
        FROM menu_item;
    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is menu_item" });
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

export const addMenu = async (req, res) => {
    const { name, price } = req.body;

    try {
        const [rows] = await db.query("INSERT INTO menu_item (name, price) VALUES (?, ?)", [name, price]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is menu_item" });
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

export const updateMenuItem = async (req, res) => {
    const itemId = req.params.id;
    const { name, price, availability_status } = req.body;

    // 1. Ensure at least one field is provided
    if (!name && price === undefined) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    // 2. Build the dynamic SQL query
    let updates = [];
    let params = [];

    if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
    }

    if (price !== undefined) {
        // Validation: Ensure the price is a positive number
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({ error: 'Invalid price value' });
        }
        updates.push("price = ?");
        params.push(price);
    }

    if (availability_status !== undefined) {
        updates.push("availability_status = ?");
        params.push(availability_status);
    }

    // Add the ID to the params array for the WHERE clause
    params.push(itemId);

    // Join the update strings: "SET name = ?, price = ?"
    const sql = `
        UPDATE menu_item 
        SET ${updates.join(', ')} 
        WHERE menu_item_id = ?
    `;

    try {
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json({
            message: 'Menu item updated successfully',
            id: itemId,
            updatedFields: req.body
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

export const getAddon = async (req, res) => {
    let sql = `
        SELECT addon_id, name, price
        FROM addon;
    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is no addon" });
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

export const addAddon = async (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: name, price' });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ success: false, message: 'Invalid price value' });
    }

    try {
        const [result] = await db.query("INSERT INTO addon (name, price) VALUES (?, ?)", [name, price]);

        res.status(201).json({
            success: true,
            message: 'Addon added successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const updateAddon = async (req, res) => {
    const addonId = req.params.id;
    const { name, price } = req.body;

    // 1. Check if at least one field was sent in the request
    if (!name && price === undefined) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    const updates = [];
    const params = [];

    // 2. Dynamically build the SET clause
    if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
    }

    if (price !== undefined) {
        // Validation for price
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({ error: 'Invalid price value' });
        }
        updates.push("price = ?");
        params.push(price);
    }

    // Add the ID for the WHERE clause
    params.push(addonId);

    const sql = `
        UPDATE addon 
        SET ${updates.join(', ')} 
        WHERE addon_id = ?
    `;

    try {
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Addon not found' });
        }

        res.status(200).json({
            message: 'Addon updated successfully',
            id: addonId,
            updatedFields: req.body
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

/*
    Request Body Structure

    {
        "packageName": "name"
        "items": [
            {
                "id": 1
                "quantity": 3
            },
            {
                "id": 2
                "quantity": 2
            }
        ]
    }
*/
export const addPackage = async (req, res) => {
    const { packageName, items } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [packageResult] = await connection.query(`INSERT INTO food_package (package_name, total_price) VALUES (?, 0)`, [packageName]);

        const generatedPackageId = packageResult.insertId;

        for (const item of items) {
            const [itemResult] = await connection.query(
                'INSERT INTO package_menu_item (menu_item_id, package_id, quantity)',
                [item.id, generatedPackageId, item.quantity]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        // Undo everything if any part of the order fails
        await connection.rollback();
        console.error("Transaction Error:", error);
        res.status(500).json({ success: false, error: "Database error occurred" });
    } finally {
        // Always release the connection back to the pool
        connection.release();
    }
};