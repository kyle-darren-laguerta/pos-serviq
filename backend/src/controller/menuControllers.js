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
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const addMenu = async (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined || isNaN(price)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid menu item fields' });
    }

    try {
        const [result] = await db.query("INSERT INTO menu_item (name, price) VALUES (?, ?)", [name, price]);

        res.status(201).json({
            success: true,
            data: { insertId: result.insertId }
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
    if (name === undefined && price === undefined && availability_status === undefined) {
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

export const getRecipe = async (req, res) => {
    const menuItemId = req.params.id;

    try {
        const [rows] = await db.query(
            `SELECT r.menu_item_id, r.ingredient_id, r.quantity_required, r.unit_of_measure,
                    i.ingredient_name
             FROM recipe r
             JOIN ingredient i ON r.ingredient_id = i.ingredient_id
             WHERE r.menu_item_id = ?`,
            [menuItemId]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

export const saveRecipe = async (req, res) => {
    const menuItemId = req.params.id;
    const { recipe } = req.body;

    if (!menuItemId) {
        return res.status(400).json({ success: false, message: 'Menu item ID is required' });
    }

    if (!Array.isArray(recipe)) {
        return res.status(400).json({ success: false, message: 'Recipe must be an array' });
    }

    const validRows = recipe.filter(row => row.ingredient_id && row.quantity_required !== undefined && row.unit_of_measure);

    try {
        await db.query('DELETE FROM recipe WHERE menu_item_id = ?', [menuItemId]);

        if (validRows.length > 0) {
            const insertValues = validRows.map(row => [
                menuItemId,
                row.ingredient_id,
                row.quantity_required,
                row.unit_of_measure
            ]);

            await db.query(
                'INSERT INTO recipe (menu_item_id, ingredient_id, quantity_required, unit_of_measure) VALUES ?',
                [insertValues]
            );
        }

        res.json({
            success: true,
            message: 'Recipe saved successfully',
            data: validRows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
};

export const getAddon = async (req, res) => {
    let sql = `
        SELECT addon_id, name, price, status
        FROM addon;
    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is no addon" });
        }

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const getMenuItemAddons = async (req, res) => {
    const menuItemId = req.params.id;

    try {
        const [rows] = await db.query(
            `SELECT a.addon_id, a.name, a.price, a.status
             FROM addon a
             JOIN menu_item_add_on m ON a.addon_id = m.addon_id
             WHERE m.menu_item_id = ? AND a.status = 'Available'`,
            [menuItemId]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const addAddon = async (req, res) => {
    const { name, price, menu_item_id, status } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: name, price' });
    }

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ success: false, message: 'Invalid price value' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const addonStatus = status ?? 'Available';
        const [result] = await connection.query(
            "INSERT INTO addon (name, price, status) VALUES (?, ?, ?)",
            [name, price, addonStatus]
        );

        const addonId = result.insertId;

        if (menu_item_id !== undefined && menu_item_id !== null && menu_item_id !== '') {
            const [menuRows] = await connection.query(
                'SELECT menu_item_id FROM menu_item WHERE menu_item_id = ?',
                [menu_item_id]
            );

            if (menuRows.length === 0) {
                throw new Error('Menu item not found');
            }

            await connection.query(
                'INSERT INTO menu_item_add_on (menu_item_id, addon_id) VALUES (?, ?)',
                [menu_item_id, addonId]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Addon added successfully',
            data: { id: addonId }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Database error" });
    } finally {
        if (connection) connection.release();
    }
}

export const assignAddonToMenuItem = async (req, res) => {
    const menuItemId = req.params.id;
    const { addon_id } = req.body;

    if (!addon_id) {
        return res.status(400).json({ success: false, message: 'Addon ID is required' });
    }

    try {
        const [menuRows] = await db.query('SELECT menu_item_id FROM menu_item WHERE menu_item_id = ?', [menuItemId]);
        if (menuRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }

        const [addonRows] = await db.query('SELECT addon_id FROM addon WHERE addon_id = ?', [addon_id]);
        if (addonRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Addon not found' });
        }

        await db.query(
            'INSERT INTO menu_item_add_on (menu_item_id, addon_id) VALUES (?, ?)',
            [menuItemId, addon_id]
        );

        res.status(201).json({ success: true, message: 'Addon assigned to menu item successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
}

export const updateAddon = async (req, res) => {
    const addonId = req.params.id;
    const { name, price, status } = req.body;

    // 1. Check if at least one field was sent in the request
    if (name === undefined && price === undefined && status === undefined) {
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

    if (status !== undefined) {
        if (typeof status !== 'string' || !['Available', 'Unavailable'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        updates.push("status = ?");
        params.push(status);
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