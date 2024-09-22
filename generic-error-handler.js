const genericErrorHandler = (err, req, res, next) => {
    console.error(err.type, err.message);
};

module.exports = genericErrorHandler;