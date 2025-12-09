const http = require('http');
const { setupDbConnection } = require('./configs/sequelize_init');

const PORT = 4500;

const bootServer = async () => {
    try {
        await setupDbConnection();
        const app = require('./app');
        const server =  http.createServer(app);

        server.listen(PORT, () => console.log(`Server listening at port: ${PORT}..`));
    } catch (err) {
        console.log("Server boot failed!");
        console.log(err);
    }
};

bootServer();