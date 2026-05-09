import db from '../config/db.js';

// Deduct ingredient stock

/* 
    Request Body Structure

    {
        "items": [
            {
            "menu_item_id": 1,
            "quantity": 2,
            "addons": [
                { "id": 1 },
            ]
            },
            {
            "menu_item_id": 2,
            "quantity": 1,
            "addons": []
            }
        ]
    }
*/
export const createBulkOrder = async (req, res) => {
    const { items } = req.body;

    // Start a session connection to handle the transaction
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create the Parent Order Record first
        const [orderResult] = await connection.query(
            'INSERT INTO order_table () VALUES ()',
            []
        );

        // This is the Database generating the Order ID for you
        const generatedOrderId = orderResult.insertId;

        for (const item of items) {
            // 1. Fetch current price for the Menu Item to "freeze" it for the receipt
            const [menuItem] = await connection.query(
                'SELECT price FROM menu_item WHERE menu_item_id = ?', 
                [item.menu_item_id]
            );

            // 2. Insert into line_item
            const [lineItemResult] = await connection.query(
                'INSERT INTO line_item (order_id, menu_item_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [generatedOrderId, item.menu_item_id, item.quantity, menuItem[0].price]
            );

            const newLineItemId = lineItemResult.insertId;

            // 3. Handle Addons for this specific line item
            if (item.addons && item.addons.length > 0) {
                for (const addon of item.addons) {
                    // Fetch current price for the Addon
                    const [addonData] = await connection.query(
                        'SELECT price FROM addon WHERE addon_id = ?', 
                        [addon.id]
                    );

                    // Insert into line_item_addon bridge table
                    await connection.query(
                        'INSERT INTO line_item_addon (line_item_id, addon_id, price_at_purchase) VALUES (?, ?, ?)',
                        [newLineItemId, addon.id, addonData[0].price]
                    );
                }
            }
        }

        // Commit all inserts if no errors occurred
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

export const createReceipt = async (req, res) => {
    const { orderID } = req.query;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'UPDATE order_table SET status = ? WHERE order_id = ?', 
            ["Paid", orderID]
        );

        const [orderAmount] = await connection.query(`
            SELECT SUM(l.quantity * m.price) AS order_amount
            FROM line_item l
            JOIN menu_item m ON m.menu_item_id = l.menu_item_id
            WHERE l.order_id = ?`, 
            [orderID]
        );

        const [addonAmount] = await connection.query(`
            SELECT SUM(la.price_at_purchase) AS addon_amount
            FROM order_table o
            JOIN line_item l ON l.order_id = o.order_id
            JOIN line_item_addon la ON la.line_item_id = l.line_item_id
            WHERE o.order_id = ?`, 
            [orderID]
        );

        const orderTotal = orderAmount[0].order_amount ?? 0;
        const addonTotal = addonAmount[0].addon_amount ?? 0;
        const grandTotal = parseFloat(orderTotal) + parseFloat(addonTotal);

        const [receiptResult] = await connection.query(
            'INSERT INTO receipt (order_id, amount, date) VALUES (?, ?, CURDATE())', 
            [orderID, grandTotal]
        );

        await connection.commit();

        res.status(201).json({ success: true, total: grandTotal });

    } catch (error) {
        await connection.rollback();
        console.error("Transaction Error:", error);
        res.status(500).json({ success: false, error: "Database error occurred" });
    } finally {
        connection.release();
    }
};

export const createReservation = async (req, res) => {
    const { location, reservation_date, down_payment, status, person_id, service_fee } = req.body;

    if (!location || !reservation_date || !status || !person_id) {
        return res.status(400).json({
            success: false,
            error: "location, reservation_date, status, and person_id are required"
        });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO Reservation (location, reservation_date, down_payment, status, person_id, service_fee) VALUES (?, ?, ?, ?, ?, ?)',
            [location, reservation_date, down_payment ?? null, status, person_id, service_fee ?? null]
        );

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation_id: result.insertId || null
        });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Database error occurred" });
    }
};

export const updateReservation = async (req, res) => {
    const { id } = req.params;
    const { location, reservation_date, down_payment, status, person_id, service_fee } = req.body;

    const updates = [];
    const params = [];

    if (location !== undefined) {
        updates.push('location = ?');
        params.push(location);
    }
    if (reservation_date !== undefined) {
        updates.push('reservation_date = ?');
        params.push(reservation_date);
    }
    if (down_payment !== undefined) {
        updates.push('down_payment = ?');
        params.push(down_payment);
    }
    if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
    }
    if (person_id !== undefined) {
        updates.push('person_id = ?');
        params.push(person_id);
    }
    if (service_fee !== undefined) {
        updates.push('service_fee = ?');
        params.push(service_fee);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one reservation field must be provided to update"
        });
    }

    params.push(id);

    try {
        const [result] = await db.query(
            `UPDATE Reservation SET ${updates.join(', ')} WHERE reservation_id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Reservation not found" });
        }

        res.json({ success: true, message: "Reservation updated successfully" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ success: false, error: "Database error occurred" });
    }
};