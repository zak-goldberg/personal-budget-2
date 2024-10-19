// Import class definitions for testing
const { Envelope, Expense } = require('../models/class-definitions.js');

// Create envelope and expense arrays
const envelopeArray = [];
const expenseArray = [];

// Add Envelope test data
envelopeArray.push(new Envelope('Groceries', 'For food and related goods', 450, 10));
envelopeArray.push(new Envelope('Gas', 'For going places', 1000, 100));
envelopeArray.push(new Envelope('Entertainment', 'Song and dance', 200, 50));
//console.log(envelopeArray);

// Add Expense test data
const expense1 = new Expense('Oreos', 'Cookies', 5, 1);
const expense2 = new Expense('Gas', 'Gas', 50, 2);
const expense3 = new Expense('ComedyShow', 'Went to a comedy show in LA', 25, 3);

expenseArray.push(expense1);
expenseArray.push(expense2);
expenseArray.push(expense3);    

module.exports = { envelopeArray, expenseArray };