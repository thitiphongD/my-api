const { DataTypes } = require('sequelize');
const { UUID, UUIDV4, STRING } = DataTypes;
const sequelize = require('../sequelize-config');

const Balance = sequelize.define('Balance', {
    balance_id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    crypto_balance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    }
});

module.exports = Balance;
