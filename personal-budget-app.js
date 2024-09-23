// Import and initialize express
const express = require('express');
const app = express();

// Set port to listen to, default for HTTP is 
const port = 80;

// Import class defintions
const { Envelope, Expense } = require('./class-definitions');

// Import envelope and expese routers and arrays
const { envelopeRouter } = require('./envelope-router.js');
// const { expenseRouter } = require('./expense-router.js');

// Import and use parameter middleware functions
// const { expenseIdValidator, envelopeIdValidator } = require('./parameter-middleware.js');
// app.param('envelopeId', envelopeIdValidator);

// register envelopeRouter & expenseRouter with the main app
app.use('/envelopes', envelopeRouter);
// app.use('/envelopes/:envelopeId/expenses', expenseRouter);

// set up server to start taking requets
app.listen(port, (req, res, next) => {
  console.log(`Server started. Listening on PORT ${port}.`);
});