// Import  express, create envelope router
const express = require('express');
const envelopeRouter = express.Router();

// Import helper functions & repositories
const { validEnvelope, convertEnvelopeToPlain } = require('../utils/utilities.js');
const { getEnvelopes, getEnvelopeById, createEnvelope, updateEnvelope, deleteEnvelope } = require('../repositories/envelopeRepositories.js');
const { getExpensesByEnvelopeId } = require('../repositories/expenseRepositories.js');

// Create a new stream to write to log file in this directory
const fs = require('fs');
const path = require('path');
const envelopeLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'envelope-logs.txt'), { flags: 'a' });

// Import and use envelopeId validation middleware
const { envelopeIdValidator } = require('../middleware/parameter-middleware.js');
envelopeRouter.param('envelopeId', envelopeIdValidator);

// Nest the expense router for /:envelopeId/expenses
const expenseRouter = require('../routes/expense-router.js');
envelopeRouter.use('/:envelopeId/expenses', expenseRouter);

// Import envelope class definition
const { Envelope } = require('../models/class-definitions.js');

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// GET /envelopes
envelopeRouter.get('/', async (req, res, next) => {
    try {
        const envelopeArray = await getEnvelopes();
        const plainEnvelopeArray = envelopeArray.map((envelope) => convertEnvelopeToPlain(envelope));
        res.send(plainEnvelopeArray);
    } catch (err) {
        return next(err);
    }
});

// GET /envelopes/:envelopeId
envelopeRouter.get('/:envelopeId', async (req, res, next) => {
    try {
        const requestedEnvelope = await getEnvelopeById(req.params.envelopeId);
        // console.log(`req.params.envelopeId: ${req.params.envelopeId}`);
        // console.log(`requestedEnvelope: ${JSON.stringify(requestedEnvelope)}`)
        const plainEnvelope = convertEnvelopeToPlain(requestedEnvelope);
        res.send(plainEnvelope);
    } catch (err) {
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1) {
            res.status(404).send();
        } else {
            return next(err);
        }
    }
});

// POST /envelopes
envelopeRouter.post('/', async (req, res, next) => {
    const envelopeRequest = req.body;
    if (validEnvelope(envelopeRequest)){
        try {
            const newEnvelope = await createEnvelope(envelopeRequest.envelopeName, envelopeRequest.envelopeDescription, envelopeRequest.totalAmountUSD);
            const plainEnvelope = convertEnvelopeToPlain(newEnvelope);
            res.send(plainEnvelope);
        } catch (err) {
            return next(err);
        }
    } else {
        const validationErr = new Error('Please enter a valid envelope.');
        return next(validationErr);
    }
});

// PUT /envelopes/:envelopeId
envelopeRouter.put('/:envelopeId', async (req, res, next) => {
    const updatedProperties = req.body;
    if (validEnvelope(updatedProperties)) {
        try {
            const updatedEnvelope = await updateEnvelope(req.params.envelopeId, updatedProperties.envelopeName, updatedProperties.envelopeDescription, updatedProperties.totalAmountUSD);
            const plainEnvelope = convertEnvelopeToPlain(updatedEnvelope);
            res.send(plainEnvelope);
        } catch (err) {
            if (err.message === 'ID not in DB.' ||
                err.message.indexOf('invalid input syntax for type integer') !== -1) {
                res.status(404).send();
            } else {
                return next(err);
            }
        }
    } else {
        const validationErr = new Error('Please enter a valid envelope.');
        return next(validationErr); 
    }
});

// DELETE /envelopes/:envelopeId
envelopeRouter.delete('/:envelopeId', async (req, res, next) => {
    try {
        await getExpensesByEnvelopeId(req.envelopeId);
    } catch (err) {
        // console.error(err.stack);
        if (err.message === 'No expenses for envelopeId.') {
            await deleteEnvelope(req.envelopeId);
            return res.status(204).send();
        } else {
            return next(err);
        }
    }
    const expenseError = new Error('Envelopes with associated expenses can\'t be deleted');
    return next(expenseError);
});

// Error handler
envelopeRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = { envelopeRouter };