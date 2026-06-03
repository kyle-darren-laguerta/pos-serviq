import db from '../config/db.js';

export const getFoodPackages = async (req, res) => {
    try {
        // Get all food packages so the UI can filter by status
        const [packages] = await db.query(`
            SELECT package_id, package_name, total_price, status 
            FROM food_package
        `);

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
                    status: pkg.status,
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
            SELECT package_id, package_name, total_price, status
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
            status: pkg.status,
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
    const { package_name, total_price, items, status } = req.body;
    const allowedStatuses = ['For Event', 'For Daily Operation'];
    const packageStatus = allowedStatuses.includes(status) ? status : 'For Daily Operation';

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Insert into food_package table
        const [result] = await connection.query(
            `INSERT INTO food_package (package_name, total_price, status) VALUES (?, ?, ?)`,
            [package_name, total_price, packageStatus]
        );

        const packageId = result.insertId;

        // Insert each menu item into the package_menu_item junction table
        for (const item of items) {
            const menuItemId = item.menu_item_id || item.id;
            const quantity = item.quantity;

            await connection.query(
                `INSERT INTO package_menu_item (menu_item_id, package_id, quantity) VALUES (?, ?, ?)`,
                [menuItemId, packageId, quantity]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Food package created successfully",
            data: { package_id: packageId, status: packageStatus }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Database error" 
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

