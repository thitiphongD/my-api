const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('buuuikfhqw5l0acqlcy2', 'uqjnic7dnnlbtjgq', 'jfD5NPBmRX4tPwA6VTt2', {
//     host: 'buuuikfhqw5l0acqlcy2-mysql.services.clever-cloud.com',
//     dialect: 'mysql',
//     logging: console.log,
// });

const sequelize = new Sequelize('my_db', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
});

sequelize.sync().then(() => {
    console.log('Database synchronized');
}).catch((error) => {
    console.error('Database synchronization error:', error);
});


module.exports = sequelize;
