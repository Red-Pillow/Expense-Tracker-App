    const Sequelize = require("sequelize");
const sequelize = require('../util/database');
const User = require('./users')


const Expense = sequelize.define('expense',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type:Sequelize.BIGINT,
        allowNull: true,
        unique: false
    },
    description:{
        type: Sequelize.STRING,
        allowNull: true,
        unique: false
    },
    category :{
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    } 
})

Expense.belongsTo(User)

module.exports = Expense;