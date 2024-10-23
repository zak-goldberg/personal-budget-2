const { pgClient } = require('../configs/db');
const { Envelope } = require('../models/class-definitions');

const getEnvelopes = async () => {
    try {
        // Use pg to fetch all envelope records
        const res = await pgClient.query('SELECT * FROM envelopes;');
        // Create envelopeArray populate with instaces of the Envelope class for each envelope returned in the query
        const envelopeArray = [];
        for (row of res.rows) {
            const envelopeItem = new Envelope (
                row.id,
                row.name,
                row.description,
                row.total_amount_usd
            );
            envelopeArray.push(envelopeItem);
        }
        // Return the populated array
        return envelopeArray;
    } catch (err) {
        // Throw any errors that arise
        throw err;
    }
};

const getEnvelopeById = async (envelopeId) => {
    try {
        // Use pg to get the envelope record given the envelopeId from the database
        const res = await pgClient.query('SELECT id, name, description, total_amount_usd FROM envelopes WHERE id = $1;', [ envelopeId ]);
        // Validate that a record was returned, if not throw a descriptive error
        if (res.rows.length === 0) throw new Error('ID not in DB.');
        // Create an instance of the Envelope class for the returned row
        const requestedEnvelope = new Envelope (
            res.rows[0].id,
            res.rows[0].name,
            res.rows[0].description,
            res.rows[0].total_amount_usd
        );
        // Return the instance of the envelope class
        return requestedEnvelope;
    } catch (err) {
        // Throw any errors that arise
        throw err;
    }
};

const createEnvelope = async (envelopeName, envelopeDescription, totalAmountUSD) => {
    try {
        // Use pg to create a new envelope given the inputs
        // Query should return the new record so it can be returned by the function
        const res = await pgClient.query('INSERT INTO envelopes (name, description, total_amount_usd) VALUES ($1, $2, $3) RETURNING id, name, description, total_amount_usd;', 
            [envelopeName, envelopeDescription, totalAmountUSD]
        );
        // Create an new instance of the envelope class for the new record
        const requestedEnvelope = new Envelope (
            res.rows[0].id,
            res.rows[0].name,
            res.rows[0].description,
            res.rows[0].total_amount_usd
        );
        // Return the instance of the envelope class
        return requestedEnvelope;
    } catch (err) {
        // Throw any errors that arise
        throw err;
    }
};

const updateEnvelope = async (envelopeId, envelopeName, envelopeDescription, totalAmountUSD) => {
    try {
        // Use pg to update the provided envelope record
        // Query should return the new record so it can be returned by the function
        const updatedEnvelopeRes = await pgClient.query('UPDATE envelopes SET name = $1, description = $2, total_amount_usd = $3 WHERE id = $4 RETURNING id, name, description, total_amount_usd;', 
            [envelopeName, envelopeDescription, totalAmountUSD, envelopeId]
        );
        // Check to see if there are any rows in the response, if not throw an error
        if (updatedEnvelopeRes.rows.length === 0) throw new Error('ID not in DB.');
        // Convert the fetched row into an instance of Envelope
        const updatedEnvelope = new Envelope (
            updatedEnvelopeRes.rows[0].id,
            updatedEnvelopeRes.rows[0].name,
            updatedEnvelopeRes.rows[0].description,
            updatedEnvelopeRes.rows[0].total_amount_usd
        );
        // Return the instance of the envelope class
        return updatedEnvelope;
    } catch (err) {
        // Throw any errors that arise
        throw err;
    }
};

const deleteEnvelope = async (envelopeId) => {
    try {
        // Use pg to delete the provided record from the DB
        await pgClient.query('DELETE FROM envelopes WHERE id = $1', [envelopeId]);
        // Return the provided id if succesful
        return envelopeId;
    } catch (err) {
        // Throw any errors that arise during the process
        throw err;
    }
};

module.exports = { getEnvelopes, getEnvelopeById, createEnvelope, updateEnvelope, deleteEnvelope };