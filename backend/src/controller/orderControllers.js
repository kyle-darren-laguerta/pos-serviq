import db from '../config/db.js';

// Deduct ingredient stock

// /* 
//     Request Body Structure

//     {
//         "items": [
//             {
//             "menu_item_id": 1,
//             "quantity": 2,
//             "addons": [
//                 { "id": 1 },
//             ]
//             },
//             {
//             "menu_item_id": 2,
//             "quantity": 1,
//             "addons": []
//             }
//         ]
//     }
// */
// export const createBulkOrder = async (req, res) => {
//     const { items } = req.body;

//     const connection = await db.getConnection();

//     try {
//         await connection.beginTransaction();

//         // 1. Create the Parent Order Record first
//         const [orderResult] = await connection.query(
//             'INSERT INTO order_table () VALUES ()',
//             []
//         );

//         const generatedOrderId = orderResult.insertId;

//         for (const item of items) {
//             // 2. Fetch current price for the Menu Item
//             const [menuItem] = await connection.query(
//                 'SELECT price FROM menu_item WHERE menu_item_id = ?',
//                 [item.menu_item_id]
//             );

//             // 3. Insert into line_item
//             const [lineItemResult] = await connection.query(
//                 'INSERT INTO line_item (order_id, menu_item_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
//                 [generatedOrderId, item.menu_item_id, item.quantity, menuItem[0].price]
//             );

//             const newLineItemId = lineItemResult.insertId;

//             // 4. Deduct ingredient stock based on this menu item's recipe
//             //    Formula: deduction = ordered quantity × quantity_required per recipe
//             await connection.query(
//                 `UPDATE ingredient i
//                  JOIN (
//                      SELECT
//                          r.ingredient_id,
//                          (? * r.quantity_required) AS total_deduction
//                      FROM recipe r
//                      WHERE r.menu_item_id = ?
//                  ) AS deductions ON i.ingredient_id = deductions.ingredient_id
//                  SET i.current_stock = i.current_stock - deductions.total_deduction`,
//                 [item.quantity, item.menu_item_id]
//             );

//             // 5. Handle Addons for this specific line item
//             if (item.addons && item.addons.length > 0) {
//                 for (const addon of item.addons) {
//                     const [addonData] = await connection.query(
//                         'SELECT price FROM addon WHERE addon_id = ?',
//                         [addon.id]
//                     );

//                     await connection.query(
//                         'INSERT INTO line_item_addon (line_item_id, addon_id, price_at_purchase, quantity) VALUES (?, ?, ?, ?)',
//                         [newLineItemId, addon.id, addonData[0].price, addon.quantity]
//                     );
//                 }
//             }
//         }

//         await connection.commit();
//         res.status(201).json({ success: true, message: "Order placed successfully" });

//     } catch (error) {
//         await connection.rollback();
//         console.error("Transaction Error:", error);
//         res.status(500).json({ success: false, error: "Database error occurred" });
//     } finally {
//         connection.release();
//     }
// };

/* 
    Request Body Structure

    {
        "items": [
            {
                "menu_item_id": 1,        // ─┐ provide one or the other,
                "quantity": 2,            //  │ not both
                "addons": [               // <┘ addons only apply to menu items
                    { "id": 1, "quantity": 1 }
                ]
            },
            {
                "package_id": 3,          // food package — no addons
                "quantity": 1,
                "addons": []
            }
        ]
    }
*/
export const createBulkOrder = async (req, res) => {
    const { items, person_id } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create the parent order record
        const orderInsertColumns = [];
        const orderInsertValues = [];

        if (person_id !== undefined && person_id !== null) {
            orderInsertColumns.push('person_id');
            orderInsertValues.push(person_id);
        }

        const orderInsertSql = orderInsertColumns.length
            ? `INSERT INTO order_table (${orderInsertColumns.join(', ')}) VALUES (${orderInsertColumns.map(() => '?').join(', ')})`
            : 'INSERT INTO order_table () VALUES ()';

        const [orderResult] = await connection.query(orderInsertSql, orderInsertValues);
        const generatedOrderId = orderResult.insertId;

        for (const item of items) {
            const isPackage = !!item.package_id;

            if (isPackage) {
                // ── PACKAGE ITEM PATH ──────────────────────────────────────

                // 2a. Fetch package price
                const [packageRows] = await connection.query(
                    'SELECT total_price FROM food_package WHERE package_id = ?',
                    [item.package_id]
                );

                if (!packageRows.length) {
                    throw new Error(`Food package ${item.package_id} not found`);
                }

                // 3a. Insert line_item — menu_item_id is NULL, package_id is set
                await connection.query(
                    `INSERT INTO line_item
                        (order_id, package_id, menu_item_id, quantity, price_at_purchase)
                     VALUES (?, ?, NULL, ?, ?)`,
                    [
                        generatedOrderId,
                        item.package_id,
                        item.quantity,
                        packageRows[0].total_price
                    ]
                );

                // 4a. Deduct ingredients for every menu item inside the package
                //     Formula: ordered_qty × package_menu_item.quantity × recipe.quantity_required
                await connection.query(
                    `UPDATE ingredient i
                     JOIN (
                         SELECT
                             r.ingredient_id,
                             (? * pmi.quantity * r.quantity_required) AS total_deduction
                         FROM package_menu_item pmi
                         JOIN recipe r ON r.menu_item_id = pmi.menu_item_id
                         WHERE pmi.package_id = ?
                     ) AS deductions ON i.ingredient_id = deductions.ingredient_id
                     SET i.current_stock = i.current_stock - deductions.total_deduction`,
                    [item.quantity, item.package_id]
                );

                // Addons are not supported for package items

            } else {
                // ── MENU ITEM PATH ─────────────────────────────────────────

                // 2b. Fetch current price for the menu item
                const [menuItemRows] = await connection.query(
                    'SELECT price FROM menu_item WHERE menu_item_id = ?',
                    [item.menu_item_id]
                );

                if (!menuItemRows.length) {
                    throw new Error(`Menu item ${item.menu_item_id} not found`);
                }

                // 3b. Insert line_item — package_id is NULL, menu_item_id is set
                const [lineItemResult] = await connection.query(
                    `INSERT INTO line_item
                        (order_id, menu_item_id, package_id, quantity, price_at_purchase)
                     VALUES (?, ?, NULL, ?, ?)`,
                    [
                        generatedOrderId,
                        item.menu_item_id,
                        item.quantity,
                        menuItemRows[0].price
                    ]
                );

                const newLineItemId = lineItemResult.insertId;

                // 4b. Deduct ingredient stock based on this menu item's recipe
                //     Formula: ordered_qty × recipe.quantity_required
                await connection.query(
                    `UPDATE ingredient i
                     JOIN (
                         SELECT
                             r.ingredient_id,
                             (? * r.quantity_required) AS total_deduction
                         FROM recipe r
                         WHERE r.menu_item_id = ?
                     ) AS deductions ON i.ingredient_id = deductions.ingredient_id
                     SET i.current_stock = i.current_stock - deductions.total_deduction`,
                    [item.quantity, item.menu_item_id]
                );

                // 5b. Handle addons for this specific line item
                if (item.addons && item.addons.length > 0) {
                    for (const addon of item.addons) {
                        const [addonData] = await connection.query(
                            'SELECT price FROM addon WHERE addon_id = ?',
                            [addon.id]
                        );

                        if (!addonData.length) {
                            throw new Error(`Addon ${addon.id} not found`);
                        }

                        await connection.query(
                            `INSERT INTO line_item_addon
                                (line_item_id, addon_id, price_at_purchase, quantity)
                             VALUES (?, ?, ?, ?)`,
                            [newLineItemId, addon.id, addonData[0].price, addon.quantity]
                        );
                    }
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Order placed successfully", order_id: generatedOrderId });

    } catch (error) {
        await connection.rollback();
        console.error("Transaction Error:", error);
        res.status(500).json({ success: false, error: error.message ?? "Database error occurred" });
    } finally {
        connection.release();
    }
};

export const createReceipt = async (req, res) => {
    const orderID = req.params.orderID;
    const parsedOrderID = Number(orderID);

    if (!parsedOrderID || isNaN(parsedOrderID)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing orderID' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [updateResult] = await connection.query(
            'UPDATE order_table SET status = ? WHERE order_id = ?', 
            ["Paid", parsedOrderID]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error('Order not found');
        }

        const [orderAmount] = await connection.query(`
            SELECT SUM(l.quantity * m.price) AS order_amount
            FROM line_item l
            JOIN menu_item m ON m.menu_item_id = l.menu_item_id
            WHERE l.order_id = ? AND l.menu_item_id IS NOT NULL`, 
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

        // Calculate food package amount
        const [packageAmount] = await connection.query(`
            SELECT COALESCE(SUM(l.quantity * fp.total_price), 0) AS package_amount
            FROM line_item l
            JOIN food_package fp ON fp.package_id = l.package_id
            WHERE l.order_id = ? AND l.package_id IS NOT NULL`,
            [orderID]
        );

        const orderTotal = orderAmount[0].order_amount ?? 0;
        const addonTotal = addonAmount[0].addon_amount ?? 0;
        const packageTotal = packageAmount[0].package_amount ?? 0;
        const grandTotal = parseFloat(orderTotal) + parseFloat(addonTotal) + parseFloat(packageTotal);

        // Calculate ingredient cost for menu items in the order
        // Formula: quantity_required * ingredient.cost_per_unit * line_item.quantity
        const [ingredientCostMenuItems] = await connection.query(`
            SELECT COALESCE(SUM(r.quantity_required * i.cost_per_unit * l.quantity), 0) AS ingredient_cost
            FROM line_item l
            JOIN recipe r ON r.menu_item_id = l.menu_item_id
            JOIN ingredient i ON i.ingredient_id = r.ingredient_id
            WHERE l.order_id = ? AND l.menu_item_id IS NOT NULL
        `, [parsedOrderID]);

        // Calculate ingredient cost for food packages
        // Formula: package_menu_item.quantity * quantity_required * ingredient.cost_per_unit * line_item.quantity
        const [ingredientCostPackages] = await connection.query(`
            SELECT COALESCE(SUM(pmi.quantity * r.quantity_required * i.cost_per_unit * l.quantity), 0) AS ingredient_cost
            FROM line_item l
            JOIN food_package fp ON fp.package_id = l.package_id
            JOIN package_menu_item pmi ON pmi.package_id = fp.package_id
            JOIN recipe r ON r.menu_item_id = pmi.menu_item_id
            JOIN ingredient i ON i.ingredient_id = r.ingredient_id
            WHERE l.order_id = ? AND l.package_id IS NOT NULL
        `, [parsedOrderID]);

        const ingredientCostMenuItemsTotal = parseFloat(ingredientCostMenuItems[0].ingredient_cost ?? 0) || 0;
        const ingredientCostPackagesTotal = parseFloat(ingredientCostPackages[0].ingredient_cost ?? 0) || 0;
        const ingredientCost = ingredientCostMenuItemsTotal + ingredientCostPackagesTotal;

        const [receiptResult] = await connection.query(
            'INSERT INTO receipt (order_id, amount, ingredient_cost, date) VALUES (?, ?, ?, CURDATE())', 
            [parsedOrderID, grandTotal, ingredientCost]
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

export const createReservationReceipt = async (req, res) => {
    const reservationID = Number(req.params.id);
    if (!reservationID || isNaN(reservationID)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing reservation id' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [reservationRows] = await connection.query(
            'SELECT reservation_id, status, down_payment, service_fee FROM reservation WHERE reservation_id = ?',
            [reservationID]
        );

        if (!reservationRows.length) {
            throw new Error('Reservation not found');
        }

        const reservation = reservationRows[0];
        if (reservation.status?.toLowerCase() !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Receipt may only be created for a completed reservation'
            });
        }

        const [existingReceiptRows] = await connection.query(
            'SELECT reservation_receipt_id FROM reservation_receipt WHERE reservation_id = ?',
            [reservationID]
        );

        if (existingReceiptRows.length) {
            return res.status(409).json({
                success: false,
                error: 'A receipt already exists for this reservation'
            });
        }

        const [packageRows] = await connection.query(
            `SELECT COALESCE(SUM(rp.quantity * fp.total_price), 0) AS package_total
             FROM reservation_package rp
             JOIN food_package fp ON fp.package_id = rp.package_id
             WHERE rp.reservation_id = ?`,
            [reservationID]
        );

        const packageTotal = parseFloat(packageRows[0]?.package_total ?? 0) || 0;
        const serviceFee = parseFloat(reservation.service_fee ?? 0) || 0;
        const totalAmount = packageTotal + serviceFee;

        const [receiptResult] = await connection.query(
            'INSERT INTO reservation_receipt (reservation_id, amount, date) VALUES (?, ?, CURDATE())',
            [reservationID, totalAmount]
        );

        await connection.commit();
        res.status(201).json({
            success: true,
            reservation_id: reservationID,
            receipt_id: receiptResult.insertId,
            total: totalAmount
        });
    } catch (error) {
        await connection.rollback();
        console.error('Reservation receipt creation failed:', error);
        res.status(500).json({ success: false, error: 'Database error occurred' });
    } finally {
        connection.release();
    }
};

export const getReservations = async (req, res) => {
    try {
        const [reservations] = await db.query(`
            SELECT 
                r.reservation_id,
                r.location,
                r.reservation_date,
                r.down_payment,
                r.status,
                r.person_id,
                r.service_fee,
                p.full_name AS customer_name,
                p.contact_number
            FROM reservation r
            LEFT JOIN person p ON r.person_id = p.person_id
            ORDER BY r.reservation_date DESC
        `);

        res.json({
            success: true,
            data: reservations
        });
    } catch (error) {
        console.error("Fetch Reservations Error:", error);
        res.status(500).json({ success: false, error: "Unable to fetch reservations" });
    }
};

export const createReservation = async (req, res) => {
    const { 
        location, reservation_date, down_payment, status, 
        customer_name, contact_number, service_fee, package_id 
    } = req.body;

    if (!location || !reservation_date || !status || !package_id) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields (location, date, status, or package_id)"
        });
    }

    // 1. Get a connection from the pool for the transaction
    const connection = await db.getConnection();

    try {
        // 2. Start the Transaction
        await connection.beginTransaction();

        // 3. Insert Person
        const [personResult] = await connection.query(
            'INSERT INTO person (full_name, contact_number, person_type) VALUES (?, ?, ?)',
            [customer_name, contact_number, 'client']
        );
        const person_id = personResult.insertId;

        await connection.query(
            'INSERT INTO client (person_id) VALUES (?)',
            [person_id]
        );

        // 4. Insert Reservation
        const [reservationResult] = await connection.query(
            'INSERT INTO reservation (location, reservation_date, down_payment, status, person_id, service_fee) VALUES (?, ?, ?, ?, ?, ?)',
            [location, reservation_date, down_payment ?? null, status, person_id, service_fee ?? null]
        );
        const reservation_id = reservationResult.insertId;

        // 5. Insert Reservation Package
        await connection.query(
            'INSERT INTO reservation_package (reservation_id, package_id, quantity) VALUES (?, ?, 1)',
            [reservation_id, package_id]
        );

        // 6. If we reached here, commit everything to the database
        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            reservation_id: reservation_id
        });

    } catch (error) {
        // 7. If ANY step fails, undo everything (Rollback)
        await connection.rollback();
        
        console.error("Transaction Error (Rolled Back):", error);
        res.status(500).json({ success: false, error: "Database error occurred" });

    } finally {
        // 8. Always release the connection back to the pool
        connection.release();
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