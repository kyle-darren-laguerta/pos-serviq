import mysql from 'mysql2/promise'; // Note: you can import promise directly in mysql2

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'serviq',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;