import db from '../config/db.js';

export const getFoodPackages = async (req, res) => {
    try {
        // Get all food packages
        const [packages] = await db.query(`
            SELECT package_id, package_name, total_price 
            FROM food_package
        `);

        if (packages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No food packages found" 
            });
        }

        // For each package, get its menu items
        const packagesWithItems = await Promise.all(
            packages.map(async (pkg) => {
                const [items] = await db.query(`
                    SELECT 
                        pmi.menu_item_id, 
                        pmi.quantity,
                        mi.name,
                        mi.price
                    FROM package_menu_item pmi
                    JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
                    WHERE pmi.package_id = ?
                `, [pkg.package_id]);

                return {
                    package_id: pkg.package_id,
                    package_name: pkg.package_name,
                    total_price: pkg.total_price,
                    items: items
                };
            })
        );

        res.json({
            success: true,
            data: packagesWithItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Database error" 
        });
    }
};

export const getFoodPackageById = async (req, res) => {
    const packageId = req.params.id;

    try {
        const [packages] = await db.query(`
            SELECT package_id, package_name, total_price 
            FROM food_package 
            WHERE package_id = ?
        `, [packageId]);

        if (packages.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Food package not found" 
            });
        }

        const pkg = packages[0];

        // Get menu items for this package
        const [items] = await db.query(`
            SELECT 
                pmi.menu_item_id, 
                pmi.quantity,
                mi.name,
                mi.price
            FROM package_menu_item pmi
            JOIN menu_item mi ON pmi.menu_item_id = mi.menu_item_id
            WHERE pmi.package_id = ?
        `, [packageId]);

        const packageData = {
            package_id: pkg.package_id,
            package_name: pkg.package_name,
            total_price: pkg.total_price,
            items: items
        };

        res.json({
            success: true,
            data: packageData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Database error" 
        });
    }
};

export const createFoodPackage = async (req, res) => {
    const { package_name, total_price, items } = req.body;

    try {
        // Insert into food_package table
        const [result] = await db.query(
            `INSERT INTO food_package (package_name, total_price) VALUES (?, ?)`,
            [package_name, total_price]
        );

        const packageId = result.insertId;

        // Insert menu items into package_menu_item table
        if (items && items.length > 0) {
            const itemValues = items.map(item => [
                item.menu_item_id,
                packageId,
                item.quantity
            ]);

            await db.query(
                `INSERT INTO package_menu_item (menu_item_id, package_id, quantity) VALUES ?`,
                [itemValues]
            );
        }

        res.status(201).json({
            success: true,
            message: "Food package created successfully",
            data: { package_id: packageId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Database error" 
        });
    }
};
