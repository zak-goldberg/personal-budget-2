// Import  express, create envelope router
const express = require('express');
const transferRouter = express.Router();

// Import helper functions
const { validEnvelope, convertEnvelopeToPlain, validTransferRequest, getEnvelopeIndex } = require('./utilities.js');

// Create a new stream to write to file in this directory
const fs = require('fs');
const path = require('path');
const transferLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'transfer-logs.txt'), { flags: 'a' });

// Import envelope array
const { envelopeArray } = require('./the-database-lol.js');

// Import generic error handler
const genericErrorHandler = require('./generic-error-handler.js');

// POST /transfers
transferRouter.post('/', (req, res, next) => {
// Validate request
    try {
    // Update the source + target as a transaction
        validTransferRequest(req.body);
        const { sourceEnvelopeId, targetEnvelopeId, transferAmount } = req.body;
        const sourceEnvelopeIndex = getEnvelopeIndex(sourceEnvelopeId);
        const targetEnvelopeIndex = getEnvelopeIndex(targetEnvelopeId);
        envelopeArray[sourceEnvelopeIndex].budgetedValueUSD -= Number(transferAmount);
        envelopeArray[targetEnvelopeIndex].budgetedValueUSD += Number(transferAmount);
        const responseArray = [
            convertEnvelopeToPlain(envelopeArray[sourceEnvelopeIndex]),
            convertEnvelopeToPlain(envelopeArray[targetEnvelopeIndex])
        ];
    // Send back an array with the source and target objects
        res.send(responseArray);
    } catch(err) {
        // console.error(err.type, err.message);
        throw err;
    }
});

// Error handler
transferRouter.use(genericErrorHandler);

// Export transferRouter as module
module.exports = { transferRouter };