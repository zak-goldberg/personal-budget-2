// Import  express, create envelope router
const express = require('express');
const envelopeRouter = express.Router();

// Import and use bodyParser and cors libraries
const bodyParser = require('body-parser');
const cors = require('cors');
envelopeRouter.use(cors());
envelopeRouter.use(bodyParser.json());

// Import envelopeArray
const { envelopeArray } = require('./personal-budget-app.js');

// Import and use envelopeId validation middleware
const envelopeIdValidator = require('./parameter-middleware.js');
envelopeRouter.parameter('envelopeId', envelopeIdValidator);

// Import envelope class definition
const { Envelope } = require('./class-definitions.js');

// Import generic error handler
const genericErrorHandler = require('./generic-error-handler.js');

// GET /envelopes
envelopeRouter.get('/', (req, res, next) => {
    res.send(envelopeArray);
});

// GET /envelopes/:envelopeId
envelopeRouter.get('/:envelopeId', (req, res, next) => {
    res.send(req.envelope);
});

const validEnvelope = (envelope) => {
  if (
    envelope.envelopeName && typeof envelope.envelopeName === 'string'
    && envelope.envelopeDescription && typeof envelope.envelopeDescription === 'string'
    && envelope.budgetedValueUSD && Number(envelope.budgetedValueUSD) !== NaN
    && envelope.totalSpentUSD && Number(envelope.totalSpentUSD) !== NaN
    ) {
    return true;
  } else {
    return false;
  }
};

// POST /envelopes
envelopeRouter.post('/', (req, res, next) => {
    const envReq = req.envelope;
    if (validEnvelope(req.envelope)){
        const newEnvelope = new Envelope(envReq.envelopeName, envReq.envelopeDescription, envReq.budgetedValueUSD, envReq.totalSpentUSD);
        envelopeArray.push(newEnvelope);
        res.send(newEnvelope);
    } else {
        const validationErr = new Error('Please enter a valid envelope.');
        return next(validationErr);
    }
});

// PUT /envelopes/:envelopeId
envelopeRouter.put('/:envelopeId', (req, res, next) => {
    const envelopeIndex = req.envelopeIndex;
    const updatedEnvelope = req.envelope;
    if (validEnvelope(req.envelope)) {
        envelopeArray[envelopeIndex].envelopeName = updatedEnvelope.envelopeName;
        envelopeArray[envelopeIndex].envelopeDescription = updatedEnvelope.envelopeDescription;
        envelopeArray[envelopeIndex].budgetedValueUSD = updatedEnvelope.budgetedValueUSD;
        envelopeArray[envelopeIndex].totalSpentUSD = updatedEnvelope.totalSpentUSD;
        res.send(updatedEnvelope);
    } else {
        const validationErr = new Error('Please enter a valid envelope.');
        return next(validationErr); 
    }
});

// DELETE /envelopes/:envelopeId
envelopeRouter.delete('/:envelopeId', (req, res, next) => {
    try {
        const envelopeIndex = req.envelopeIndex;
        envelopeArray.splice(envelopeIndex, 1);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
});

// Error handler
envelopeRouter.use(genericErrorHandler);

// Export envelopeRouter as module
module.exports = { envelopeRouter, envelopeArray };