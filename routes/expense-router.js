// Import  express, create envelope router
const express = require('express');
const expenseRouter = express.Router();

// Import helper functions
const { validEnvelope, convertEnvelopeToPlain, validEnvelopeId, getEnvelopeIndex, validExpense, convertExpenseToPlain, getExpensesByEnvelopeId, validExpenseId } = require('./utilities.js');

// Create a new stream to write to file in this directory
const fs = require('fs');
const path = require('path');
const expenseLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'expense-logs.txt'), { flags: 'a' });

// Import envelope array
const { envelopeArray, expenseArray } = require('./the-database-lol.js');

// Import envelope class definition
const { Envelope, Expense } = require('./class-definitions.js');

// Import generic error handler
const genericErrorHandler = require('./generic-error-handler.js');

// Import and use expenseId validator
const { expenseIdValidator } = require('./parameter-middleware.js');
expenseRouter.param('expenseId', expenseIdValidator);

// GET /expenses
// GET /envelopes/:envelope_id/expenses
expenseRouter.get('/', (req, res, next) => {
// if req.envelope exists, envelopeIdValidator ran on the request and it included an :envelopeId in the path
    if (req.envelope) {
        const filteredExpenses = getExpensesByEnvelopeId(Number(req.envelopeId));
        const plainExpenseArray = filteredExpenses.map((expense) => convertExpenseToPlain(expense));
        res.send(plainExpenseArray);
// if not, this is just a request for all /expenses
    } else {
        const plainExpenseArray = expenseArray.map((expense) => convertExpenseToPlain(expense));
        res.send(plainExpenseArray);
    }
});

// GET /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.get('/:expenseId', (req, res, next) => {
    res.send(convertExpenseToPlain(req.expense));
});

// POST /envelopes/:envelope_id/expenses
expenseRouter.post('/', (req, res, next) => {
    // Validate the request body
    if (validExpense(req.body)) {
        // As a transaction, update the expense and envelope arrays
        try {
            const expenseAmountUSD = req.body.expenseAmountUSD;
            const envelopeId = req.envelopeId;
            const newExpense = new Expense(req.body.expenseName, req.body.expenseDescription, expenseAmountUSD, envelopeId);
            expenseArray.push(newExpense);
            if (validEnvelopeId(envelopeId)) {
                const envelopeIndex = getEnvelopeIndex(envelopeId);
                envelopeArray[envelopeIndex].totalSpentUSD += expenseAmountUSD;
            } else {
                throw new Error('Provide a valid envelopeId in the request.')
            }
            // Convert the new expense to a plain object and return it
            const plainExpense = convertExpenseToPlain(newExpense);
            res.send(plainExpense);
        } catch (err) {
            console.error(err.type, err.message);
            throw err;
        }
    } else {
        throw new Error('Please include a valid expense in the request.');
    }
});

// PUT /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.put('/:expenseId', (req, res, next) => {
    // Validate the request body, including the expense id (param middleware)
    if (validExpense(req.body)) {
        // As a transaction, update the expense and envelope arrays
        try {
            const newExpenseAmt = Number(req.body.expenseAmountUSD);
            const changeInExpenseAmt = newExpenseAmt - req.expense.expenseAmountUSD;
            expenseArray[req.expenseIndex].expenseName = req.body.expenseName;
            expenseArray[req.expenseIndex].expenseDescription = req.body.expenseDescription;
            expenseArray[req.expenseIndex].expenseAmountUSD = newExpenseAmt;
            // Update the totalSpentUSD for the corresponding envelope
            envelopeArray[req.envelopeIndex].totalSpentUSD += changeInExpenseAmt;
            const updatedExpensePlain = convertExpenseToPlain(expenseArray[req.expenseIndex]);
            // Return the updated expense
            res.send(updatedExpensePlain);
        } catch (err) {
            console.error(err.type, err.message);
            throw err;
        }
    } else {
        throw new Error('Please include valid expense properities in the request body.')
    }
});

// DELETE /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.delete('/:expenseId', (req, res, next) => {
    try {
        envelopeArray[req.envelopeIndex].totalSpentUSD -= Number(req.expense.expenseAmountUSD);
        expenseArray.splice(req.expenseIndex, 1);
        res.status(204).send();
    } catch (err) {
        console.error(err.type, err.message);
        throw err;
    }
});

// Error handler
expenseRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = expenseRouter;