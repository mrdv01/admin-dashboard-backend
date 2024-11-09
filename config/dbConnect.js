// config/dbConnect.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

// Create a MySQL connection pool (to handle multiple queries efficiently)
const dbConnect = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

export default dbConnect;
