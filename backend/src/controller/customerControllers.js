import db from '../config/db.js';

const selectCustomerQuery = `
  SELECT
    p.person_id,
    p.full_name,
    p.contact_number,
    c.location_zone_id,
    l.location_name,
    l.delivery_rate
  FROM person p
  JOIN customer c ON p.person_id = c.person_id
  LEFT JOIN location_zone l ON c.location_zone_id = l.location_zone_id
  ORDER BY p.full_name
`;

const selectClientFallbackQuery = `
  SELECT
    p.person_id,
    p.full_name,
    p.contact_number,
    NULL AS location_zone_id,
    NULL AS location_name,
    NULL AS delivery_rate
  FROM person p
  JOIN client c ON p.person_id = c.person_id
  WHERE p.person_type = 'client'
  ORDER BY p.full_name
`;

export const getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query(selectCustomerQuery);
    return res.json({ success: true, data: customers });
  } catch (error) {
    if (error.errno === 1146) {
      try {
        const [customers] = await db.query(selectClientFallbackQuery);
        return res.json({ success: true, data: customers });
      } catch (fallbackError) {
        console.error('Fetch Customers Fallback Error:', fallbackError);
        return res.status(500).json({ success: false, error: 'Unable to fetch customers' });
      }
    }

    console.error('Fetch Customers Error:', error);
    res.status(500).json({ success: false, error: 'Unable to fetch customers' });
  }
};

export const createCustomer = async (req, res) => {
  const { full_name, contact_number, location_zone_id } = req.body;

  if (!full_name || location_zone_id === undefined || location_zone_id === null) {
    return res.status(400).json({
      success: false,
      error: 'full_name and location_zone_id are required'
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [personResult] = await connection.query(
      'INSERT INTO person (full_name, contact_number, person_type) VALUES (?, ?, ?)',
      [full_name, contact_number || null, 'customer']
    );

    const person_id = personResult.insertId;

    try {
      await connection.query(
        'INSERT INTO customer (person_id, location_zone_id) VALUES (?, ?)',
        [person_id, location_zone_id]
      );
    } catch (nestedError) {
      if (nestedError.errno === 1146) {
        await connection.query('INSERT INTO client (person_id) VALUES (?)', [person_id]);
      } else {
        throw nestedError;
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      person_id,
      location_zone_id
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create Customer Error:', error);
    res.status(500).json({ success: false, error: 'Unable to create customer' });
  } finally {
    connection.release();
  }
};
