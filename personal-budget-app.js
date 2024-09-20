// Import and initialize express
const express = require('express');
const app = express();

// Set port to listen to, default for HTTP is 
const port = 80;

// Import class defintions
const { Envelope, Expense } = require('./class-definitions');

// Create arrays for envelopes and expenses
const allEnvelopes = [];
const allExpenses = [];

app.listen(port, (req, res, next) => {
  console.log(`Server started. Listening on PORT ${port}.`);
});