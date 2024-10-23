const { pgClient } = require('../configs/db');
const { Expense } = require('../models/class-definitions');
const { deleteEnvelope } = require('./envelopeRepositories');

const getExpensesByEnvelopeId = async (envelopeId) => {
    try {
        // Query DB for expenses by envelopeId
        const res = await pgClient.query('SELECT * FROM expenses WHERE envelope_id = $1;', [envelopeId]);
        // If result is empty, throw an error
        if (res.rows.length === 0) throw new Error('No expenses for envelopeId.');
        // Create an array to store instances of the Expense class in
        const expenseArray = [];
        // For loop to create an instance of the Expense class for each object in the result
        for (row of res.rows) {
            const expenseItem = new Expense (
                row.id,
                row.description,
                row.amount_usd,
                row.envelope_id
            );
            expenseArray.push(expenseItem);
        }
        // Return the array with the instance of the Expense class in it
        return expenseArray; 
    } catch (err) {
        throw err;
    }  
};

const getExpenseByExpenseId = async (expenseId) => {
    try {
        // Query DB for expense by envelopeId and expenseId
        const res = await pgClient.query('SELECT * FROM expenses WHERE id = $1;', [expenseId]);
        // If result is empty, throw an error
        if (res.rows.length === 0) throw new Error(`Expense ID ${expenseId} not in DB.`);
        // Create an instance of the Expense class for the result
        const requestedExpense = new Expense (
            res.rows[0].id,
            res.rows[0].description,
            res.rows[0].amount_usd,
            res.rows[0].envelope_id
        );
        // Return the instance of the Expense class
        return requestedExpense; 
    } catch (err) {
        // Throw any errors
        throw err;
    }  
};

const createExpense = async (expenseDescription, expenseAmountUSD, envelopeId) => {
    try {
        // Create expense in the database using the expense property inputs
        // Return expense properties so they can be returned by the function
        const res = await pgClient.query('INSERT INTO expenses (description, amount_usd, envelope_id) VALUES ($1, $2, $3) RETURNING id, description, amount_usd, envelope_id;', 
            [expenseDescription, expenseAmountUSD, envelopeId]
        );
        // Create an instance of the Expense class for the new record
        const requestedExpense = new Expense (
            res.rows[0].id,
            res.rows[0].description,
            res.rows[0].amount_usd,
            res.rows[0].envelope_id
        );
        // Return created instance of Expense
        return requestedExpense;
    } catch (err) {
        // Throw any errors
        throw err;
    }    
};

const updateExpense = async (expenseId, expenseDescription, expenseAmountUSD, envelopeId) => {
    try {
        // Query to update the provided record in the database
        const res = await pgClient.query('UPDATE expenses SET description = $1, amount_usd = $2, envelope_id = $3 WHERE id = $4 RETURNING id, description, amount_usd, envelope_id;', 
            [expenseDescription, expenseAmountUSD, envelopeId, expenseId]
        );
        // Check to see if there are any rows in the response, if not throw an error
        if (res.rows.length === 0) throw new Error(`Envelope ID ${envelopeId} or expense ID ${expenseId} not in DB.`);
        // Convert the fetched row into an instance of Envelope
        const requestedExpense = new Expense (
            res.rows[0].id,
            res.rows[0].description,
            res.rows[0].amount_usd,
            res.rows[0].envelope_id
        );
        // Return the instance of the envelope class
        return requestedExpense;
    } catch (err) {
        // Throw any errors
        throw err;
    }
};

const deleteExpense = async (expenseId) => {
    try {
        // Query to delete the record from the DB
        await pgClient.query('DELETE FROM expenses WHERE id = $1', [expenseId]);
        // If succesful, return the deleted expenseId
        return expenseId;
    } catch (err) {
        throw err;
    }
};

module.exports = { getExpensesByEnvelopeId, getExpenseByExpenseId, createExpense, updateExpense, deleteExpense }