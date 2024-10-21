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
    try {
            // Validate request body
            validTransferRequest(req.body);
            // Update the source + target as a transaction
            const { sourceEnvelopeId, targetEnvelopeId, transferAmount } = req.body;
            // console.log(`sourceEnvelopeId: ${sourceEnvelopeId}`);
            // console.log(`targetEnvelopeId: ${targetEnvelopeId}`);
            // GET source envelope
            const sourceEnvelope = await getEnvelopeById(sourceEnvelopeId);
            // GET target envelope
            const targetEnvelope = await getEnvelopeById(targetEnvelopeId);
            // Update the source envelope
            const updatedSourceEnvelope = await updateEnvelope(
                sourceEnvelopeId,
                sourceEnvelope.envelopeName,
                sourceEnvelope.envelopeDescription,
                currencyArithmetic.subtract(sourceEnvelope.totalAmountUSD, transferAmount)
            );
            // Update the target envelope
            const updatedTargetEnvelope = await updateEnvelope(
                targetEnvelopeId,
                targetEnvelope.envelopeName,
                targetEnvelope.envelopeDescription,
                currencyArithmetic.add(targetEnvelope.totalAmountUSD, transferAmount)
            );
            // Construct response body
            const responseArray = [
                convertEnvelopeToPlain(updatedSourceEnvelope),
                convertEnvelopeToPlain(updatedTargetEnvelope)
            ];
            // Send a succesful request
            res.status(200).send();
        } catch (err) {
            return next(err);
        }
    });

// Error handler
transferRouter.use(genericErrorHandler);

// Export transferRouter as module
module.exports = { transferRouter };