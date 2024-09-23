// Import  express, create envelope router
const express = require('express');
const envelopeRouter = express.Router();

// Import and use bodyParser,cors, and morgan libraries
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
envelopeRouter.use(cors());
envelopeRouter.use(bodyParser.json());
envelopeRouter.use(morgan('dev'));

// Import helper functions
const { validEnvelope, convertEnvelopeToPlain } = require('./utilities.js');

// Create a new stream to write to file in this directory
const fs = require('fs');
const path = require('path');
const envelopeLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'envelope-logs.txt'), { flags: 'a' });

// Import envelope array
const { envelopeArray } = require('./the-database-lol.js');

// Import and use envelopeId validation middleware
const { envelopeIdValidator } = require('./parameter-middleware.js');
envelopeRouter.param('envelopeId', envelopeIdValidator);

// Import envelope class definition
const { Envelope } = require('./class-definitions.js');

// Import generic error handler
const genericErrorHandler = require('./generic-error-handler.js');

// GET /envelopes
envelopeRouter.get('/', (req, res, next) => {
    const plainEnvelopeArray = envelopeArray.map((envelope) => convertEnvelopeToPlain(envelope));
    res.send(plainEnvelopeArray);
});

// GET /envelopes/:envelopeId
envelopeRouter.get('/:envelopeId', (req, res, next) => {
    const plainEnvelope = convertEnvelopeToPlain(req.envelope);
    res.send(plainEnvelope);
});

// POST /envelopes
envelopeRouter.post('/', (req, res, next) => {
    const envelopeRequest = req.body;
    if (validEnvelope(envelopeRequest)){
        const newEnvelope = new Envelope(envelopeRequest.envelopeName, envelopeRequest.envelopeDescription, envelopeRequest.budgetedValueUSD, envelopeRequest.totalSpentUSD);
        envelopeArray.push(newEnvelope);
        const plainEnvelope = convertEnvelopeToPlain(newEnvelope);
        res.send(plainEnvelope);
    } else {
        const validationErr = new Error('Please enter a valid envelope.');
        return next(validationErr);
    }
});

// PUT /envelopes/:envelopeId
envelopeRouter.put('/:envelopeId', (req, res, next) => {
    const envelopeIndex = req.envelopeIndex;
    const updatedEnvelope = req.body;
    if (validEnvelope(req.envelope)) {
        envelopeArray[envelopeIndex].envelopeName = updatedEnvelope.envelopeName;
        envelopeArray[envelopeIndex].envelopeDescription = updatedEnvelope.envelopeDescription;
        envelopeArray[envelopeIndex].budgetedValueUSD = updatedEnvelope.budgetedValueUSD;
        envelopeArray[envelopeIndex].totalSpentUSD = updatedEnvelope.totalSpentUSD;
        const plainEnvelope = convertEnvelopeToPlain(envelopeArray[envelopeIndex]);
        res.send(plainEnvelope);
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
module.exports = { envelopeRouter };