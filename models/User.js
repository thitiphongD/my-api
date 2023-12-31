const { DataTypes } = require('sequelize');
const { UUID, UUIDV4 } = DataTypes;
const sequelize = require('../sequelize-config');
const UserWallets = require('./UserWallets');

const User = sequelize.define('users', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = User;
