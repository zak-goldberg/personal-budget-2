// Import and initialize express
const express = require('express');
const app = express();

// Import and use bodyParser,cors, and morgan libraries
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Set port to listen to, default for HTTP is 
const port = 80;

// Import class defintions
const { Envelope, Expense } = require('./models/class-definitions');

// Import envelope and expese routers and arrays
const { envelopeRouter } = require('./routes/envelope-router.js');
const { transferRouter } = require('./routes/transfer-router.js');
const expenseRouter = require('./routes/expense-router.js');

// Import and use parameter middleware functions
// const { expenseIdValidator, envelopeIdValidator } = require('./parameter-middleware.js');
// app.param('envelopeId', envelopeIdValidator);

// register envelopeRouter, transferRouter, & expenseRouter with the main app
app.use('/envelopes', envelopeRouter);
app.use('/transfers', transferRouter);
app.use('/expenses', expenseRouter);

// set up server to start taking requets
app.listen(port, (req, res, next) => {
  console.log(`Server started. Listening on PORT ${port}.`);
});

module.exports = app;