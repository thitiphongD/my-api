const { DataTypes } = require('sequelize');
const { UUID, UUIDV4, STRING } = DataTypes;
const sequelize = require('../sequelize-config');

const Crypto = sequelize.define('Crypto', {
    currency_id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = Crypto;