const express = require('express');
const app = express();
const PORT = 8080;
const mysql = require("mysql2/promise");
const cors = require('cors');
app.use(express.json());
app.use(cors());


const pool = mysql.createPool({
    host: 'buuuikfhqw5l0acqlcy2-mysql.services.clever-cloud.com',
    user: 'uqjnic7dnnlbtjgq',
    password: 'jfD5NPBmRX4tPwA6VTt2',
    database: 'buuuikfhqw5l0acqlcy2',
    waitForConnections: true
});
console.log('Connected to MySQL database');

pool.on('error', (err) => {
    console.error('MySQL pool error:', err);
});

app.get('/users', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.query('SELECT * FROM users');
        connection.release();

        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Internal server error',
        });
    }
});

app.get('/hello', (req, res) => {
    res.status(200).json({
        message: 'Hello, World!'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});