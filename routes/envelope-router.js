// Import  express, create envelope router
const express = require('express');
const envelopeRouter = express.Router();

// Import helper functions & repositories
const { validEnvelope, convertEnvelopeToPlain } = require('../utils/utilities.js');
const { getEnvelopes, getEnvelopeById, createEnvelope, updateEnvelope, deleteEnvelope } = require('../repositories/envelopeRepositories.js');
const { getExpensesByEnvelopeId } = require('../repositories/expenseRepositories.js');

// Import and use envelopeId validation middleware
const { envelopeIdValidator } = require('../middleware/parameter-middleware.js');
envelopeRouter.param('envelopeId', envelopeIdValidator);

// Nest the expense router for /:envelopeId/expenses
const expenseRouter = require('../routes/expense-router.js');
envelopeRouter.use('/:envelopeId/expenses', expenseRouter);

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// GET /envelopes
envelopeRouter.get('/', async (req, res, next) => {
    try {
        // Get all envelopes in the DB
        const envelopeArray = await getEnvelopes();
        // Convert each item in the array to a plain object
        const plainEnvelopeArray = envelopeArray.map((envelope) => convertEnvelopeToPlain(envelope));
        // Send the converted array back as the response
        res.status(200).send(plainEnvelopeArray);
    } catch (err) {
        // Pass any errors to the generic error handler
        return next(err);
    }
});

// GET /envelopes/:envelopeId
envelopeRouter.get('/:envelopeId', async (req, res, next) => {
    try {
        // Get envelope from DB given an envelope id
        const requestedEnvelope = await getEnvelopeById(req.envelopeId);
        // Conver the envelope to a plain object
        const plainEnvelope = convertEnvelopeToPlain(requestedEnvelope);
        // Send the plain object back in the response
        res.status(200).send(plainEnvelope);
    } catch (err) {
        // Handle errors associated with invalid envelopeIds
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1) {
            // Send 404 status when passed an invalid envelopeId
            res.status(404).send();
        } else {
            // Pass other errors to the generic error handler
            return next(err);
        }
    }
});

// POST /envelopes
envelopeRouter.post('/', async (req, res, next) => {
    // Add the request body to a binding
    const envelopeRequest = req.body;
    // Validate the request body
    if (validEnvelope(envelopeRequest)){
        try {
            // Call createEnvelope with validated request body
            const newEnvelope = await createEnvelope (
                envelopeRequest.envelopeName, 
                envelopeRequest.envelopeDescription, 
                envelopeRequest.totalAmountUSD
            );
            // Convert result to a plain object
            const plainEnvelope = convertEnvelopeToPlain(newEnvelope);
            // Send the plain object back in the request
            res.status(200).send(plainEnvelope);
        } catch (err) {
            // Pass any errors to the generic error handler
            return next(err);
        }
    } else {
        // Handle a request body that failed validation
        return next(new Error('Please enter a valid envelope.'));
    }
});

// PUT /envelopes/:envelopeId
envelopeRouter.put('/:envelopeId', async (req, res, next) => {
    // Create a binding for the request body
    const updatedProperties = req.body;
    // Validate the request body
    if (validEnvelope(updatedProperties)) {
        try {
            // Call updateEnvelope() with properties from the request body
            const updatedEnvelope = await updateEnvelope(
                req.params.envelopeId, 
                updatedProperties.envelopeName, 
                updatedProperties.envelopeDescription, 
                updatedProperties.totalAmountUSD
            );
            // Convert the returned, updated envelope to a plain object
            const plainEnvelope = convertEnvelopeToPlain(updatedEnvelope);
            // Send the plain object back in the response
            res.status(200).send(plainEnvelope);
        } catch (err) {
            // Handle errors related to invalid envelopeIds
            if (err.message === 'ID not in DB.' ||
                err.message.indexOf('invalid input syntax for type integer') !== -1) {
                // Send a 404 status for invalid envelopeIds
                res.status(404).send();
            } else {
                // Send other errors to the generic error handler
                return next(err);
            }
        }
    } else {
        // Handle a request body that failed validation
        return next(new Error('Please enter a valid envelope.')); 
    }
});

// DELETE /envelopes/:envelopeId
envelopeRouter.delete('/:envelopeId', async (req, res, next) => {
    try {
        // Call helper function to check if there are expenses associated with the envelope
        await getExpensesByEnvelopeId(req.envelopeId);
    } catch (err) {
        // Handle the case where there are **no** expenses associated with the envelopeId
        if (err.message === 'No expenses for envelopeId.') {
            // Call helper function to delete the envelopeId from the database
            await deleteEnvelope(req.envelopeId);
            // If succesful send a 204 status in the response
            return res.status(204).send();
        // Handle the case where there are expenses associated with the envelopeId
        } else {
            // Pass other errors to the generic error handler
            return next(err);
        }
    }
    // Handle the case where there are expenses associated with the envelopeId
    // Pass a new error to the generic error handler
    return next(new Error('Envelopes with associated expenses can\'t be deleted'));
});

// Error handler
envelopeRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = { envelopeRouter };