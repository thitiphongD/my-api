const { DataTypes } = require('sequelize');
const { UUID, UUIDV4, STRING } = DataTypes;
const sequelize = require('../sequelize-config');
const Balance = require('./Balance.js')

const User = sequelize.define('User', {
    user_id: {
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

User.hasOne(Balance, { foreignKey: 'user_id' });

module.exports = User;
