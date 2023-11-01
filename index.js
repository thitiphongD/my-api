// app.js
const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');
app.use(express.json());
app.use(cors());

const db = require('./db'); // Import the database connection
const routes = require('./routes'); // Import the router

// Use the router for specific routes
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
