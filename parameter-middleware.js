// Import envelope and expense array
const { envelopeArray, expenseArray } = require('./the-database-lol.js');

// Import envelope and expense id validator helper functions
const { validEnvelopeId, validExpenseId } = require('./utilities.js');

// envelopeId validation
// add req.envelope, req.envelopeId, req.envelopeIndex
const envelopeIdValidator = (req, res, next, id) => {
    if (validEnvelopeId(Number(id))) {
        const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => {
            accumulator.push(currentValue.envelopeId);
            return accumulator;
        }, []);
        const envelopeIndex = arrayOfIds.indexOf(Number(id));
        req.envelopeIndex = envelopeIndex;
        req.envelope = envelopeArray[envelopeIndex];
        req.envelopeId = Number(id);
        next();
    } else {
        return next(new Error('Please provide a valid envelope id.'));
    }
};

// expenseId validation
const expenseIdValidator = (req, res, next, id) => {
    if (validExpenseId(Number(id))) {
        const arrayOfIds = expenseArray.reduce((accumulator, currentValue) => {
            accumulator.push(currentValue.expenseId);
            return accumulator;
        }, []);
        const expenseIndex = arrayOfIds.indexOf(Number(id));
        req.expenseIndex = expenseIndex;
        req.expense = expenseArray[expenseIndex];
        req.expenseId = Number(id);
        next();
    } else {
        return next(new Error('Please provide a valid expense id.'));
    }
};

module.exports = { envelopeIdValidator, expenseIdValidator };