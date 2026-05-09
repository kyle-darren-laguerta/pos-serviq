import db from '../config/db.js';

export const addIngredient = async (req, res) => {
    const { name, unitOfMeasurement, minStock, costPerUnit, currentStock} = req.body;

    try {
        const [result] = await db.query("INSERT INTO ingredient (ingredient_name, unit_of_measure, minimum_stock_level, cost_per_unit, current_stock) VALUES (?, ?, ?, ?, ?)", [name, unitOfMeasurement, minStock, costPerUnit, currentStock]);

        res.status(201).json({
            success: true,
            message: "Ingredient data inserted successfully",
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
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

    try {
        const [result] = await db.query(
            "INSERT INTO waste_item (quantity, reason_category, ingredient_id, waste_date) VALUES (?, ?, ?, ?)",
            [quantity, reason_category, ingredient_id, waste_date]
        );

        res.status(201).json({
            success: true,
            message: "Waste item inserted successfully",
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database error" });
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

export const updateIngredient = async (req, res) => {
    const ingredientId = req.params.id;
    const { name, unitOfMeasurement, minStock, costPerUnit, currentStock } = req.body;

    if (name === undefined && unitOfMeasurement === undefined && minStock === undefined && costPerUnit === undefined && currentStock === undefined) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
        updates.push("ingredient_name = ?");
        params.push(name);
    }

    if (unitOfMeasurement !== undefined) {
        updates.push("unit_of_measure = ?");
        params.push(unitOfMeasurement);
    }

    if (minStock !== undefined) {
        if (typeof minStock !== 'number' || minStock < 0) {
            return res.status(400).json({ error: 'Invalid minimum stock value' });
        }
        updates.push("minimum_stock_level = ?");
        params.push(minStock);
    }

    if (costPerUnit !== undefined) {
        if (typeof costPerUnit !== 'number' || costPerUnit < 0) {
            return res.status(400).json({ error: 'Invalid cost per unit value' });
        }
        updates.push("cost_per_unit = ?");
        params.push(costPerUnit);
    }

    if (currentStock !== undefined) {
        if (typeof currentStock !== 'number' || currentStock < 0) {
            return res.status(400).json({ error: 'Invalid current stock value' });
        }
        updates.push("current_stock = ?");
        params.push(currentStock);
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