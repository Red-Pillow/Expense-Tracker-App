const Sequelize = require("sequelize");

const sequelize = require('../util/database');

const User = sequelize.define('user',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: Sequelize.STRING,
    //ispremiumuser: Sequelize.BOOLEAN,
    totalExpenses:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    ispremiumuser: {
        type: Sequelize.BOOLEAN, // or whatever data type is appropriate
        defaultValue: false, // You can set a default value if needed
    }
})


module.exports = User;