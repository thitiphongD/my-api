const User = require('../models/User');
const UserWallets = require('../models/UserWallets');
const Currency = require('../models/Currency');

exports.getHello = (req, res) => {
    res.send('Hello, World!');
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const newUser = await User.create({
            username,
            email,
            password,
            role,
        });

        const currencies = await Currency.findAll();

        const userWalletsPromises = currencies.map(async (currency) => {
            try {
                return await UserWallets.create({
                    user_id: newUser.id,
                    currency_id: currency.id,
                    balance: '0', // Set initial balance as needed
                });
            } catch (walletError) {
                console.error('Error creating user wallet:', walletError);
                throw walletError; // Rethrow the error to be caught by the outer catch block
            }
        });

        const newUserWallets = await Promise.all(userWalletsPromises);

        res.status(200).json({ newUser, newUserWallets });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'User creation failed' });
    }
};

