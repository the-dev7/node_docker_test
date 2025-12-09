const TestTable = require("../model/test-table");

const findAllFields = async () => {
    return await TestTable.findAll({
        attributes: ['id', 'text'],
    });
};

const createNewField = async (text) => {
    return await TestTable.create({
        text: text
    });
}

module.exports = {
    findAllFields,
    createNewField,
};