const { pgClient } = require('../configs/db');
const { Expense } = require('../models/class-definitions');
const { deleteEnvelope } = require('./envelopeRepositories');

const getExpensesByEnvelopeId = async (envelopeId) => {
    try {
        // Query DB for expenses by envelopeId
        const res = await pgClient.query('SELECT * FROM expenses WHERE envelope_id = $1;', [envelopeId]);
        // If result is empty, throw an error
        if (res.rows.length === 0) throw new Error('Envelope ID not in DB.');
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
        console.error(err.stack);
        throw err;
    }  
};

const getExpenseByExpenseId = async (expenseId) => {
    let requestedExpense;
    try {
        // Query DB for expense by envelopeId and expenseId
        const res = await pgClient.query('SELECT * FROM expenses WHERE expense_id = $1;', [expenseId]);
        // If result is empty, throw an error
        if (res.rows.length === 0) throw new Error(`Expense ID ${expenseId} not in DB.`);
        // Convert the array result to an object
        const resultObject = res.rows[0];
        // Create an instance of the Expense class using the resultObject
        requestedExpense = new Expense (
                resultObject.id,
                resultObject.description,
                resultObject.amount_usd,
                resultObject.envelope_id
            );
        // Return the instance of the Expense class
        return requestedExpense; 
    } catch (err) {
        console.error(err.stack);
        throw err;
    }  
};

const createExpense = async (expenseDescription, expenseAmountUSD, envelopeId) => {
    try {
        // Create row based on the expense properity inputs
        await pgClient.query('INSERT INTO expenses (description, amount_usd, envelope_id) VALUES ($1, $2, $3);', 
            [expenseDescription, expenseAmountUSD, envelopeId]
        );
        // Get expenses from the database with matching properties
        // There may be multiple expenses with the same property so ordering by id descending and taking the first one (zero index)
        // Assuming that multiple similar expenses with the same properties aren't being created concurrently
        const res = await pgClient.query('SELECT id, description, amount_usd, envelope_id FROM expenses WHERE description = $1 AND amount_usd = $2 AND envelope_id = $3 ORDER BY id DESC;',
            [envelopeName, envelopeDescription, totalAmountUSD]
        );
        const resultObject = res.rows[0];
        // Create an instance of the Expense class based on the properties
        const requestedExpense = new Expense (
            resultObject.id,
            resultObject.description,
            resultObject.amount_usd,
            resultObject.envelope_id
        );
        return requestedEnvelope;
    } catch (err) {
        console.error(err.stack);
        throw err;
    }    
};

const updateEnvelope = async (expenseId, expenseDescription, expenseAmountUSD, envelopeId) => {
    try {
        // Query to update the database based on the given inputs
        await pgClient.query('UPDATE expenses SET description = $1, amount_usd = $2, envelope_id = $3 WHERE id = $4;', 
            [expenseDescription, expenseAmountUSD, envelopeId, expenseId]
        );
        
        // Fetch the updated row from the DB
        const res = await pgClient.query('SELECT id, description, amount_usd, envelope_id FROM expenses WHERE id = $1;',
            [expenseId]
        );
        // Check to see if there are any rows in the response, if not throw an error
        if (res.rows.length === 0) throw new Error(`Envelope ID ${envelopeId} or expense ID ${expenseId} not in DB.`);
        // Convert the fetched row into an instance of Envelope
        const resultObject = res.rows[0];
        const requestedExpense = new Expense (
            resultObject.id,
            resultObject.description,
            resultObject.amount_usd,
            resultObject.envelope_id
        );
        return requestedExpense;
    } catch (err) {
        console.error(err.stack);
        throw err;
    }
};

const deleteExpense = async (expenseId) => {
    try {
        // Query to delete the record from the DB
        await pgClient.query('DELETE FROM envelopes WHERE id = $1', [expenseId]);
        return expenseId;
    } catch (err) {
        throw err;
    }
};

module.exports = { getExpensesByEnvelopeId, getExpenseByExpenseId, createExpense, updateEnvelope, deleteExpense }