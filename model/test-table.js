const Sequelize = require('sequelize');

const { getDbConnection } = require('../configs/sequelize_init');
const sequelize = getDbConnection();

const TestTable = sequelize.define(
    "TestTable",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        text: {
            type: Sequelize.STRING
        },
    },
    {
        paranoid: true,
        tableName: "test_table",
        defaultScope: {
            attributes: {
              exclude: ["updatedAt", "deletedAt"],
            },
        },
    }
);

module.exports = TestTable;