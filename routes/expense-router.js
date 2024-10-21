// Import  express, create envelope router
const express = require('express');
const expenseRouter = express.Router();

// Import helper functions & repositories
const { validEnvelope, convertEnvelopeToPlain, getEnvelopeIndex, validExpense, convertExpenseToPlain, validExpenseId } = require('../utils/utilities.js');
const { getExpensesByEnvelopeId, getExpenseByExpenseId, createExpense, updateExpense, deleteExpense } = require('../repositories/expenseRepositories.js');

// Create a new stream to write to file in this directory
const fs = require('fs');
const path = require('path');
const expenseLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'expense-logs.txt'), { flags: 'a' });

// Import envelope array
/*
const { envelopeArray, expenseArray } = require('../test/the-database-lol.js');
*/

// Import expense class definition
const { Expense } = require('../models/class-definitions.js');

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// Import and use expenseId validator
const { expenseIdValidator } = require('../middleware/parameter-middleware.js');
expenseRouter.param('expenseId', expenseIdValidator);

// GET /expenses
// GET /envelopes/:envelope_id/expenses
expenseRouter.get('/', async (req, res, next) => {
    try {
        // console.log(`req.envelopeId: ${req.envelopeId}`);
        const expenseArray = await getExpensesByEnvelopeId(req.envelopeId);
        const plainExpenseArray = expenseArray.map((expense) => convertExpenseToPlain(expense));
        res.status(200).send(plainExpenseArray);
    } catch (err) {
        return next(err);
    }    
});

// GET /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.get('/:expenseId', async (req, res, next) => {
    try {
        const requestedExpense = await getExpenseByExpenseId(req.expenseId);
        // console.log(`req.params.envelopeId: ${req.params.envelopeId}`);
        // console.log(`requestedEnvelope: ${JSON.stringify(requestedEnvelope)}`)
        const plainExpense = convertExpenseToPlain(requestedExpense);
        res.status(200).send(plainExpense);
    } catch (err) {
        if (err.message === 'No expenses for envelopeId.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1 ||
            err.message.indexOf('is out of range for type integer') !== -1) {
            res.status(404).send();
        } else {
            return next(err);
        }
    }
    // res.send(convertExpenseToPlain(req.expense));
});

// POST /envelopes/:envelope_id/expenses
// TO-DO: add validation to check that envelopeId in path matches envelopeId in body
expenseRouter.post('/', async (req, res, next) => {
    const expenseRequest = req.body;
    // Validate the request body
    console.log(`In expense router: expenseRequest: ${JSON.stringify(expenseRequest)}`);
    if (validExpense(expenseRequest)) {
        // As a transaction, update the expense and envelope arrays
        try {
            const newExpense = await createExpense(
                expenseRequest.expenseDescription,
                expenseRequest.expenseAmountUSD,
                expenseRequest.envelopeId
            );
        /*    
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
        */        
            // Convert the new expense to a plain object and return it
            const plainExpense = convertExpenseToPlain(newExpense);
            res.status(200).send(plainExpense);
        } catch (err) {
            console.error(err.stack);
            return next(err);
        }
    } else {
        const validErr = new Error('Please include a valid expense in the request.');
        return next(validErr);
    }
});

// PUT /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.put('/:expenseId', async (req, res, next) => {
    const expenseRequest = req.body;
    // Validate the request body, including the expense id (param middleware)
    if (validExpense(expenseRequest)) {
        if (req.expenseId !== expenseRequest.expenseId.toString()) {
            const matchErr = new Error('expenseId in path does not match expenseId in body.');
            return next(matchErr);
        }
        // As a transaction, update the expense and envelope arrays
        try {
            const updatedExpense = await updateExpense(
                expenseRequest.expenseId,
                expenseRequest.expenseDescription,
                expenseRequest.expenseAmountUSD,
                expenseRequest.envelopeId
            );
            /*
            const newExpenseAmt = Number(req.body.expenseAmountUSD);
            const changeInExpenseAmt = newExpenseAmt - req.expense.expenseAmountUSD;
            expenseArray[req.expenseIndex].expenseName = req.body.expenseName;
            expenseArray[req.expenseIndex].expenseDescription = req.body.expenseDescription;
            expenseArray[req.expenseIndex].expenseAmountUSD = newExpenseAmt;
            // Update the totalSpentUSD for the corresponding envelope
            envelopeArray[req.envelopeIndex].totalSpentUSD += changeInExpenseAmt;
            */
            const updatedExpensePlain = convertExpenseToPlain(updatedExpense);
            // Return the updated expense
            res.status(200).send(updatedExpensePlain);
        } catch (err) {
            console.error(err.stack);
            return next(err);
        }
    } else {
        const validErr = new Error('Please include valid expense properities in the request body.');
        return next(validErr);
    }
});

// DELETE /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.delete('/:expenseId', async (req, res, next) => {
    try {
        await deleteExpense(req.expenseId);
        /*
        envelopeArray[req.envelopeIndex].totalSpentUSD -= Number(req.expense.expenseAmountUSD);
        expenseArray.splice(req.expenseIndex, 1);
        */
        res.status(204).send();
    } catch (err) {
        console.error(err.stack);
        return next(err.stack);
    }
});

// Error handler
expenseRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = expenseRouter;