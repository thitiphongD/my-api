// app.js
const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
app.use(express.json());
app.use(cors());
const mainRoutes = require('./routes/mainRoutes')
const sequelize = require('./sequelize-config');

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

app.use('/', mainRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
