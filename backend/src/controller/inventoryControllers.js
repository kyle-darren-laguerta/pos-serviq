import db from '../config/db.js';

export const getIngredients = async (req, res) => {
    let sql = `
        SELECT ingredient_id, ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock
        FROM ingredient;
    `;
    const params = [];

    try {
        const [rows] = await db.query(sql, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: "There is ingredient" });
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

export const addIngredient = async (req, res) => {
    const { ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock, supplier_id, date_supplied } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            "INSERT INTO ingredient (ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock) VALUES (?, ?, ?, ?, ?)",
            [ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock]
        );

        const ingredientId = result.insertId;

        if (supplier_id !== undefined && supplier_id !== null && supplier_id !== '') {
            if (typeof supplier_id !== 'number' || supplier_id <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid supplier_id value' });
            }

            const [supplierRows] = await connection.query(
                "SELECT supplier_id FROM supplier WHERE supplier_id = ?",
                [supplier_id]
            );

            if (supplierRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Supplier not found' });
            }

            const supplyDate = date_supplied || new Date().toISOString().slice(0, 10);

            await connection.query(
                "INSERT INTO supplier_ingredient (supplier_id, ingredient_id, date_supplied, quantity, supplied_price) VALUES (?, ?, ?, ?, ?)",
                [supplier_id, ingredientId, supplyDate, current_stock, cost_per_unit]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Ingredient data inserted successfully",
            data: { id: ingredientId }
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    } finally {
        connection.release();
    }
}

export const addWasteItem = async (req, res) => {
    const { quantity, reason_category, ingredient_id, waste_date } = req.body;

    if (quantity === undefined || reason_category === undefined || ingredient_id === undefined || waste_date === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: quantity, reason_category, ingredient_id, waste_date' });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity value' });
    }

    if (typeof ingredient_id !== 'number' || ingredient_id <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid ingredient_id value' });
    }

    if (typeof reason_category !== 'string' || reason_category.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid reason_category value' });
    }

    const parsedDate = new Date(waste_date);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid waste_date value' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [ingredientRows] = await connection.query(
            "SELECT current_stock FROM ingredient WHERE ingredient_id = ?",
            [ingredient_id]
        );

        if (ingredientRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        const currentStock = Number(ingredientRows[0].current_stock);

        if (currentStock < quantity) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Insufficient stock to record waste' });
        }

        const [result] = await connection.query(
            "INSERT INTO waste_item (quantity, reason_category, ingredient_id, waste_date) VALUES (?, ?, ?, ?)",
            [quantity, reason_category, ingredient_id, waste_date]
        );

        await connection.query(
            "UPDATE ingredient SET current_stock = ? WHERE ingredient_id = ?",
            [currentStock - quantity, ingredient_id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Waste item recorded successfully",
            data: { id: result.insertId }
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    } finally {
        connection.release();
    }
}

export const addSupplier = async (req, res) => {
    const { supplier_name, contact_number, supplier_address } = req.body;

    if (supplier_name === undefined || contact_number === undefined || supplier_address === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: supplier_name, contact_number, supplier_address' });
    }

    if (typeof supplier_name !== 'string' || supplier_name.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid supplier_name value' });
    }

    if (typeof contact_number !== 'string' || contact_number.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid contact_number value' });
    }

    if (typeof supplier_address !== 'string' || supplier_address.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid supplier_address value' });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO supplier (supplier_name, contact_number, supplier_address) VALUES (?, ?, ?)",
            [supplier_name, contact_number, supplier_address]
        );

        res.status(201).json({
            success: true,
            message: "Supplier added successfully",
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const getSuppliers = async (req, res) => {
    const sql = `
        SELECT supplier_id, supplier_name, contact_number, supplier_address
        FROM supplier
        ORDER BY supplier_name ASC;
    `;

    try {
        const [rows] = await db.query(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const getSupplierIngredients = async (req, res) => {
    const sql = `
        SELECT
            si.supplier_id,
            s.supplier_name,
            si.ingredient_id,
            i.ingredient_name,
            DATE_FORMAT(si.date_supplied, '%Y-%m-%d') AS date_supplied,
            si.quantity,
            si.supplied_price
        FROM supplier_ingredient si
        JOIN supplier s ON si.supplier_id = s.supplier_id
        LEFT JOIN ingredient i ON si.ingredient_id = i.ingredient_id
        ORDER BY si.date_supplied DESC, si.supplier_id ASC;
    `;

    try {
        const [rows] = await db.query(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const addSupplierIngredient = async (req, res) => {
    const { supplier_id, ingredient_id, quantity, supplied_price, date_supplied } = req.body;

    if (supplier_id === undefined || ingredient_id === undefined || quantity === undefined || supplied_price === undefined || date_supplied === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: supplier_id, ingredient_id, quantity, supplied_price, date_supplied' });
    }

    if (typeof supplier_id !== 'number' || supplier_id <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid supplier_id value' });
    }

    if (typeof ingredient_id !== 'number' || ingredient_id <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid ingredient_id value' });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid quantity value' });
    }

    if (typeof supplied_price !== 'number' || supplied_price < 0) {
        return res.status(400).json({ success: false, message: 'Invalid supplied_price value' });
    }

    const parsedDate = new Date(date_supplied);
    if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date_supplied value' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [supplierRows] = await connection.query(
            "SELECT supplier_id FROM supplier WHERE supplier_id = ?",
            [supplier_id]
        );

        if (supplierRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }

        const [ingredientRows] = await connection.query(
            "SELECT current_stock FROM ingredient WHERE ingredient_id = ?",
            [ingredient_id]
        );

        if (ingredientRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        const currentStock = Number(ingredientRows[0].current_stock);

        const [result] = await connection.query(
            "INSERT INTO supplier_ingredient (supplier_id, ingredient_id, date_supplied, quantity, supplied_price) VALUES (?, ?, ?, ?, ?)",
            [supplier_id, ingredient_id, date_supplied, quantity, supplied_price]
        );

        await connection.query(
            "UPDATE ingredient SET current_stock = ? WHERE ingredient_id = ?",
            [currentStock + quantity, ingredient_id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Supplier ingredient record added successfully",
            data: { supplier_id, ingredient_id }
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    } finally {
        connection.release();
    }
}

export const updateIngredient = async (req, res) => {
    const ingredientId = req.params.id;
    const { ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock } = req.body;

    if (ingredient_name === undefined && unit_of_measure === undefined && minimum_stock_level === undefined && cost_per_unit === undefined && current_stock === undefined) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    const updates = [];
    const params = [];

    if (ingredient_name !== undefined) {
        updates.push("ingredient_name = ?");
        params.push(ingredient_name);
    }

    if (unit_of_measure !== undefined) {
        updates.push("unit_of_measure = ?");
        params.push(unit_of_measure);
    }

    if (minimum_stock_level !== undefined) {
        if (typeof minimum_stock_level !== 'number' || minimum_stock_level < 0) {
            return res.status(400).json({ error: 'Invalid minimum stock value' });
        }
        updates.push("minimum_stock_level = ?");
        params.push(minimum_stock_level);
    }

    if (cost_per_unit !== undefined) {
        if (typeof cost_per_unit !== 'number' || cost_per_unit < 0) {
            return res.status(400).json({ error: 'Invalid cost per unit value' });
        }
        updates.push("cost_per_unit = ?");
        params.push(cost_per_unit);
    }

    if (current_stock !== undefined) {
        if (typeof current_stock !== 'number' || current_stock < 0) {
            return res.status(400).json({ error: 'Invalid current stock value' });
        }
        updates.push("current_stock = ?");
        params.push(current_stock);
    }

    params.push(ingredientId);

    const sql = `
        UPDATE ingredient
        SET ${updates.join(', ')}
        WHERE ingredient_id = ?
    `;

    try {
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        res.status(200).json({
            message: 'Ingredient updated successfully',
            id: ingredientId,
            updatedFields: req.body
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}

export const getWasteItems = async (req, res) => {
    const sql = `
        SELECT w.waste_item_id,
               w.quantity,
               w.reason_category,
               DATE_FORMAT(w.waste_date, '%Y-%m-%d') AS waste_date,
               w.ingredient_id,
               i.ingredient_name,
               i.unit_of_measure
        FROM waste_item w
        JOIN ingredient i ON w.ingredient_id = i.ingredient_id
        ORDER BY w.waste_date DESC, w.waste_item_id DESC;
    `;

    try {
        const [rows] = await db.query(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
    }
}