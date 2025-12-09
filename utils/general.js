const serverResponse = (statusCode, message, data, res) => {
    res.status(statusCode).json({
        status: "SUCCESS",
        message,
        data
    });
};

module.exports = { serverResponse };