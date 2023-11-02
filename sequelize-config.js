// sequelize-config.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('buuuikfhqw5l0acqlcy2', 'uqjnic7dnnlbtjgq', 'jfD5NPBmRX4tPwA6VTt2', {
    host: 'buuuikfhqw5l0acqlcy2-mysql.services.clever-cloud.com',
    dialect: 'mysql',
});

module.exports = sequelize;
