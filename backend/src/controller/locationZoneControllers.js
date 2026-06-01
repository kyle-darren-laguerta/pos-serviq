import db from '../config/db.js';

export const getLocationZones = async (req, res) => {
  try {
    const [zones] = await db.query(
      'SELECT location_zone_id, location_name, delivery_rate FROM location_zone'
    );

    res.json({ success: true, data: zones });
  } catch (error) {
    console.error('Fetch Location Zones Error:', error);
    res.status(500).json({ success: false, error: 'Unable to fetch location zones' });
  }
};

export const createLocationZone = async (req, res) => {
  const { location_name, delivery_rate } = req.body;

  if (!location_name || delivery_rate === undefined || delivery_rate === null) {
    return res.status(400).json({
      success: false,
      error: 'location_name and delivery_rate are required'
    });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO location_zone (location_name, delivery_rate) VALUES (?, ?)',
      [location_name, parseFloat(delivery_rate)]
    );

    res.status(201).json({
      success: true,
      message: 'Location zone created successfully',
      location_zone_id: result.insertId
    });
  } catch (error) {
    console.error('Create Location Zone Error:', error);
    res.status(500).json({ success: false, error: 'Unable to create location zone' });
  }
};
