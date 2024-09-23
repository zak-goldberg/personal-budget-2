// Import envelope and expense array
const { envelopeArray } = require('./the-database-lol.js');

// Import envelope and expense id validator helper functions
const { validEnvelopeId } = require('./utilities.js');

// envelopeId validation
// add req.envelope, req.envelopeId, req.envelopeIndex
const envelopeIdValidator = (req, res, next, id) => {
    if (validEnvelopeId(Number(id))) {
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
    const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => accumulator.push(currentValue.envelopeId), []);
    if (arrayOfIds.includes(id)) {
        req.expense = req.body;
        req.expenseId = id;
        req.expenseIndex = arrayOfIds.indexOf(id);
    } else {
        return next(new Error('Please provide a valid expense id.'));
    }
};

module.exports = { envelopeIdValidator, expenseIdValidator };