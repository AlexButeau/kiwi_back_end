//getting the .env file
require('dotenv').config();

// importing mySql
const mysql = require('mysql2/promise');

const getConnection = mysql.createConnection({
  host: process.env.DB_HOST, // address of the server
  user: process.env.DB_USER, // username
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = getConnection;
