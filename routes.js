// routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

router.get('/custom', (req, res) => {
    res.json({ message: 'This is a custom route.' });
});

router.get('/data', (req, res) => {
    const data = {
        name: 'John Doe',
        age: 30,
        city: 'Example City'
    };
    res.json(data);
});

module.exports = router;
