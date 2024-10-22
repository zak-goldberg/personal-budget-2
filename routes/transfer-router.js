// Import  express, create envelope router
const express = require('express');
const transferRouter = express.Router();

// Import helper functions & envelope repository functions
const { validEnvelope, convertEnvelopeToPlain, validTransferRequest, getEnvelopeIndex, currencyArithmetic } = require('../utils/utilities.js');
const { updateEnvelope, getEnvelopeById } = require('../repositories/envelopeRepositories.js');

// Create a new stream to write to file in this directory
const fs = require('fs');
const path = require('path');
const transferLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'transfer-logs.txt'), { flags: 'a' });

// Import envelope array
const { envelopeArray } = require('../test/the-database-lol.js');

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// POST /transfers
transferRouter.post('/', async (req, res, next) => {
    // TO-DO: add some kind of auto-rollback mechanism if one part of the transfer is unsuccesful
    // Validate request body
    try {
        await validTransferRequest(req.body);
    } catch (err) {
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1 ||
            err.message.indexOf('is out of range for type integer') !== -1) {
                return res.status(404).send();
        } else {
            return next(err);
    }
    }
    try {
            // Update the source + target as a transaction
            const { sourceEnvelopeId, targetEnvelopeId, transferAmount } = req.body;
            /*
            console.log(`sourceEnvelopeId: ${sourceEnvelopeId}`);
            console.log(`targetEnvelopeId: ${targetEnvelopeId}`);
            console.log(`transferAmount: ${transferAmount}`);
            console.log(`typeof transferAmount: ${typeof transferAmount}`);
            */
            // GET source envelope
            const sourceEnvelope = await getEnvelopeById(sourceEnvelopeId);
            // console.log(`sourceEnvelope: ${JSON.stringify(sourceEnvelope)}`);
            // console.log(`sourceEnvelope.totalAmountUSD: ${typeof sourceEnvelope.totalAmountUSD}`);
            // GET target envelope
            const targetEnvelope = await getEnvelopeById(targetEnvelopeId);
            // console.log(`targetEnvelope: ${JSON.stringify(targetEnvelope)}`);
            // console.log(`targetEnvelope.totalAmountUSD: ${typeof targetEnvelope.totalAmountUSD}`);
            // Compute new total amount USD values
            const updatedSourceTotalAmountUSD = currencyArithmetic.subtract(sourceEnvelope.totalAmountUSD, transferAmount);
            const updatedTargetTotalAmountUSD = currencyArithmetic.add(targetEnvelope.totalAmountUSD, transferAmount);
            // Update the source envelope
            const updatedSourceEnvelope = await updateEnvelope(
                sourceEnvelopeId,
                sourceEnvelope.envelopeName,
                sourceEnvelope.envelopeDescription,
                updatedSourceTotalAmountUSD
            );
            // Update the target envelope
            const updatedTargetEnvelope = await updateEnvelope(
                targetEnvelopeId,
                targetEnvelope.envelopeName,
                targetEnvelope.envelopeDescription,
                updatedTargetTotalAmountUSD
            );
            // Construct response body
            const responseArray = [
                convertEnvelopeToPlain(updatedSourceEnvelope),
                convertEnvelopeToPlain(updatedTargetEnvelope)
            ];
            // Send a succesful request
            res.status(200).send();
        } catch (err) {
            console.error(err.stack);
            return next(err);
        }
    });

// Error handler
transferRouter.use(genericErrorHandler);

// Export transferRouter as module
module.exports = { transferRouter };