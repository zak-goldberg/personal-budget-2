// Import  express, create envelope router
const express = require('express');
const expenseRouter = express.Router();

// Import helper functions & repositories
const { validExpense, convertExpenseToPlain } = require('../utils/utilities.js');
const { getExpensesByEnvelopeId, getExpenseByExpenseId, createExpense, updateExpense, deleteExpense } = require('../repositories/expenseRepositories.js');

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// Import and use expenseId validator
const { expenseIdValidator } = require('../middleware/parameter-middleware.js');
expenseRouter.param('expenseId', expenseIdValidator);

// GET /expenses
// GET /envelopes/:envelope_id/expenses
expenseRouter.get('/', async (req, res, next) => {
    try {
        // Call helper function to getExpensesByEnvelopeId
        const expenseArray = await getExpensesByEnvelopeId(req.envelopeId);
        // Convert expenses in the array to plain objects
        const plainExpenseArray = expenseArray.map((expense) => convertExpenseToPlain(expense));
        // Send the array of plain objects in the request
        res.status(200).send(plainExpenseArray);
    } catch (err) {
        // Pass any errors to the generic error handler
        return next(err);
    }    
});

// GET /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.get('/:expenseId', async (req, res, next) => {
    try {
        // Call helper function to getExpenseByExpenseId
        const requestedExpense = await getExpenseByExpenseId(req.expenseId);
        // Convert the expense to a plain object
        const plainExpense = convertExpenseToPlain(requestedExpense);
        // Send the plain object back as the response
        res.status(200).send(plainExpense);
    } catch (err) {
        // Handle the case where the expenseId is not in the DB or invalid
        if (err.message === 'No expenses for envelopeId.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1 ||
            err.message.indexOf('is out of range for type integer') !== -1) {
            // Send a 404 in the response
            res.status(404).send();
        } else {
            // Pass other errors to the generic error handler
            return next(err);
        }
    }
});

// POST /envelopes/:envelope_id/expenses
expenseRouter.post('/', async (req, res, next) => {
    // Create a binding for the request body
    const expenseRequest = req.body;
    // Validate that the envelopeId in the path matches the envelopeId in the body and throw a descriptive error
    if(!expenseRequest.envelopeId || req.envelopeId !== expenseRequest.envelopeId.toString()) {
        return next(new Error('envelopeId in path does not match envelopeId in body.'));
    }
    // Validate the request body
    if (validExpense(expenseRequest)) {
        try {
            // Call helper function to createExpense from request body
            const newExpense = await createExpense (
                expenseRequest.expenseDescription,
                expenseRequest.expenseAmountUSD,
                expenseRequest.envelopeId
            );      
            // Convert the new expense to a plain object
            const plainExpense = convertExpenseToPlain(newExpense);
            // Send the plain object back in the response
            res.status(200).send(plainExpense);
        } catch (err) {
            // Pass any errors to the generic error handler
            return next(err);
        }
    } else {
        // Handle the case where validation of the request body failed
        // Pass a descriptive error to the generic error handler
        return next(new Error('Please include a valid expense in the request.'));
    }
});

// PUT /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.put('/:expenseId', async (req, res, next) => {
    // Create a binding for the request body
    const expenseRequest = req.body;
    // Validate that the envelopeId in the path matches the envelopeId in the body and throw a descriptive error
    if(!expenseRequest.envelopeId || req.envelopeId !== expenseRequest.envelopeId.toString()) {
        return next(new Error('envelopeId in path does not match envelopeId in body.'));
    }
    // Validate the request body, including the expense id (param middleware)
    if (validExpense(expenseRequest)) {
        // Validate that the expenseId in the path matches the expenseId in the body and throw a descriptive error
        if (req.expenseId !== expenseRequest.expenseId.toString()) {
            return next(new Error('expenseId in path does not match expenseId in body.'));
        }
        // Call helper function to update the expense in the database
        try {
            const updatedExpense = await updateExpense(
                expenseRequest.expenseId,
                expenseRequest.expenseDescription,
                expenseRequest.expenseAmountUSD,
                expenseRequest.envelopeId
            );
            // Convert the updated expense to a plain object
            const updatedExpensePlain = convertExpenseToPlain(updatedExpense);
            // Return the plain object
            res.status(200).send(updatedExpensePlain);
        } catch (err) {
            // Pass any errors to the generic error handler
            return next(err);
        }
    } else {
        // Handle the case where validation of the request body failed.
        // Pass a descritptive error to the generic error handler.
        return next(new Error('Please include valid expense properities in the request body.'));
    }
});

// DELETE /envelopes/:envelope_id/expenses/:expense_id
expenseRouter.delete('/:expenseId', async (req, res, next) => {
    try {
        // Call helper function to delete the expense from the database
        await deleteExpense(req.expenseId);
        // If succesful, send a 204 status as part of the response
        res.status(204).send();
    } catch (err) {
        // Pass any errors ot the generic error handler
        return next(err);
    }
});

// Error handler
expenseRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = expenseRouter;