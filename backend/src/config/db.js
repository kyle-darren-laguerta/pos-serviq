import mysql from 'mysql2/promise'; // Note: you can import promise directly in mysql2

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'serviq',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;