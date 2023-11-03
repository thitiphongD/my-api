const { DataTypes } = require('sequelize');
const { UUID, UUIDV4 } = DataTypes;
const sequelize = require('../sequelize-config');
const Currency = require('./Currency');

const UserWallets = sequelize.define('userWallets', {
    id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    currency_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    balance: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

UserWallets.belongsTo(Currency, {
    foreignKey: 'currency_id',
    as: 'currency',
});

module.exports = UserWallets;
