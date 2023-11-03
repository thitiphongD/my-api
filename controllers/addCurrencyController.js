const Currency = require('../models/Currency');

exports.addCurrency = async (req, res) => {
    try {
        const { name, symbol } = req.body;

        const newCurrency = await Currency.create({
            name, symbol,
        });

        res.status(200).json({ newCurrency })

    } catch (error) {
        console.error('Error creating Currency:', error)
        res.status(500).json({ error: 'Create Currency fail' });
    }
}