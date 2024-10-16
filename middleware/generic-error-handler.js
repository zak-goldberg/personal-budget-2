const genericErrorHandler = (err, req, res, next) => {
    console.error(err.type, err.message);
    res.status(400).send(err.message);
};

module.exports = genericErrorHandler;