// Import envelope and expense array
const { envelopeArray, expenseArray } = require('../test/the-database-lol.js');

// Import envelope and expense id validator helper functions
const { validEnvelopeId, validExpenseId } = require('../utils/utilities.js');

// Import getEnvelopeById
const { getEnvelopeById } = require('../repositories/envelopeRepositories.js');

// envelopeId validation
// add req.envelope, req.envelopeId, req.envelopeIndex
const envelopeIdValidator = async (req, res, next, id) => {
    try {
        await getEnvelopeById(id);
        next();
    } catch (err) {
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1) {
            res.status(404).send();
        } else {
            return next(err);
        }
    }
    /*
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
    */
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