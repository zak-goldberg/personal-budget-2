// Import  express, create envelope router
const express = require('express');
const transferRouter = express.Router();

// Import helper functions & envelope repository functions
const { convertEnvelopeToPlain, validTransferRequest, currencyArithmetic } = require('../utils/utilities.js');
const { updateEnvelope, getEnvelopeById } = require('../repositories/envelopeRepositories.js');

// Import generic error handler
const genericErrorHandler = require('../middleware/generic-error-handler.js');

// POST /transfers
transferRouter.post('/', async (req, res, next) => {
    // TO-DO: add some kind of auto-rollback mechanism if one part of the transfer is unsuccesful
    // Validate request body
    try {
        await validTransferRequest(req.body);
    // Handle case where the request body fails validation
    } catch (err) {
        // Handle specific errors for invalid envelopeIds and send a 404 status
        if (err.message === 'ID not in DB.' ||
            err.message.indexOf('invalid input syntax for type integer') !== -1 ||
            err.message.indexOf('is out of range for type integer') !== -1) {
                return res.status(404).send();
        } else {
            // Pass other errors to the generic error handler
            return next(err);
        }
    }
    
    // Create bindings for the keys in the request body
    const { sourceEnvelopeId, targetEnvelopeId, transferAmount } = req.body;
    // Initialize variables that assigned in try block
    let sourceEnvelope;
    let targetEnvelope;
    let updatedSourceTotalAmountUSD;
    let updatedTargetTotalAmountUSD;
    let updatedSourceEnvelope;
    
    try {
        // Invoke helper function to GET source envelope
        sourceEnvelope = await getEnvelopeById(sourceEnvelopeId);
        // Invoke helper function to GET target envelope
        targetEnvelope = await getEnvelopeById(targetEnvelopeId);
        // Invoke helper function to compute new total amount USD values
        updatedSourceTotalAmountUSD = currencyArithmetic.subtract(sourceEnvelope.totalAmountUSD, transferAmount);
        updatedTargetTotalAmountUSD = currencyArithmetic.add(targetEnvelope.totalAmountUSD, transferAmount);
    } catch(err) {
        // Pass any errors to the generic error handler
        return next(err);
    }
    
    try {
        // Update the source envelope
        updatedSourceEnvelope = await updateEnvelope(
            sourceEnvelopeId,
            sourceEnvelope.envelopeName,
            sourceEnvelope.envelopeDescription,
            updatedSourceTotalAmountUSD
        );
    } catch(err) {
        // Pass any errors to the generic error handler
        return next(err);
    }

    try {
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
        // Send the responseArray in the response
        res.status(200).send(responseArray);
    } catch (err) {
        return next(err);
    }
});

// Error handler
transferRouter.use(genericErrorHandler);

// Export transferRouter as module
module.exports = { transferRouter };