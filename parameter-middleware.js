// Import envelope and expense array
const { envelopeArray, expenseArray } = require('./personal-budget-app.js');

// envelopeId validation
// add req.envelope, req.envelopeId, req.envelopeIndex
const envelopeIdValidator = (req, res, next, id) => {
    const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => accumulator.push(currentValue.envelopeId), []);
    if (arrayOfIds.includes(id)) {
        req.envelope = req.body;
        req.envelopeId = id;
        req.envelopeIndex = arrayOfIds.indexOf(id);
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