// app.js
const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
app.use(express.json());
app.use(cors());

// const db = require('./db'); // Import the database connection
const routes = require('./routes'); // Import the router

const sequelize = require('./sequelize-config');
const User = require('./models/User');

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the database');

        await sequelize.sync({ force: true }); // Use { force: true } to drop and recreate tables

        console.log('Models synced with the database');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initialize();

// Use the router for specific routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
