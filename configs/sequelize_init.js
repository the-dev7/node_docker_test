const { Sequelize } = require('sequelize');

const configs = {
    db: 'node_test',
    user: 'root',
    password: 'abhin',
    host: 'localhost',
    port: '9000'
}

let sequelize = null;

const setupDbConnection = async () => {

    const sequelize = new Sequelize(
        configs.db,
        configs.user,
        configs.password,
        {
            host: configs.host,
            port: configs.port,
            dialect: 'mysql',
            define: {
                underscored: true,
            },
            pool: {
                max: 50,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
            logging: false,
        }
    );

    try {
        await sequelize.authenticate();
        console.log("DB connected successfully");
    } catch(err) {
        console.error("Unable to connect DB: ", err);
    }

    return sequelize;
};

const getDbConnection = () => {
    if (!sequelize) {
        return new Sequelize(
            configs.db,
            configs.user,
            configs.password,
            {
              host: configs.host,
              port: configs.port,
              dialect: "mysql",
              define: {
                underscored: true,
              },
              logging: false,
            },
        );
    }
    return sequelize;
}

module.exports = { setupDbConnection, getDbConnection };