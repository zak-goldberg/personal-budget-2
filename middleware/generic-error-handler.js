const genericErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(400).send(err.message);
};

module.exports = genericErrorHandler;