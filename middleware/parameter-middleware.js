// Import getEnvelopeById & getExpenseByExpenseId
const { getEnvelopeById } = require('../repositories/envelopeRepositories.js');
const { getExpenseByExpenseId } = require('../repositories/expenseRepositories.js');

const envelopeIdValidator = async (req, res, next, id) => {
    try {
        // Use helper function to see if there is a record for the provided envelopeId
        await getEnvelopeById(id);
        // Add envelopeId to req
        req.envelopeId = id;
        // Pass to the next middleware
        next();
    } catch (err) {
        // Handle the case where the provided envelopeId is not in the database
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1) {
            // Send a 404 status in the response
            res.status(404).send();
        } else {
            // Otherwise pass any other errors to the generic error handler
            return next(err);
        }
    }
};

// expenseId validation
const expenseIdValidator = async (req, res, next, id) => {
    try {
        // Use helper function to see if there is a record for the provided expenseId
        await getExpenseByExpenseId(id);
        // Add expenseId to req
        req.expenseId = id;
        // Pass to the next middleware
        next();
    } catch (err) {
        // Handle the case where the expenseId provided is not in the database
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer' !== -1) ||
            err.message.indexOf('is out of range for type integer' !== -1)) {
            // Send a 404 status in the response
            res.status(404).send();
        } else {
        // Otherwise pass error to the generic error handler    
            return next(err);
        }
    }
};

module.exports = { envelopeIdValidator, expenseIdValidator };