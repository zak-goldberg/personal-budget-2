const { pgClient } = require('../configs/db');
const { Envelope } = require('../models/class-definitions');

const getEnvelopes = async () => {
    const res = await pgClient.query('SELECT * FROM envelopes;');
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
    return envelopeArray;
};

const getEnvelopeById = async (envelopeId) => {
    let requestedEnvelope;
    try {
        const res = await pgClient.query('SELECT id, name, description, total_amount_usd FROM envelopes WHERE id = $1;', [ envelopeId ]);
        if (res.rows.length === 0) throw new Error('ID not in DB.');
        const resultObject = res.rows[0];
        requestedEnvelope = new Envelope (
            resultObject.id,
            resultObject.name,
            resultObject.description,
            resultObject.total_amount_usd
        );
        return requestedEnvelope;
    } catch (err) {
        // console.error(err.stack);
        throw err;
    }
};

const createEnvelope = async (envelopeName, envelopeDescription, totalAmountUSD) => {
    try {
        await pgClient.query('INSERT INTO envelopes (name, description, total_amount_usd) VALUES ($1, $2, $3);', 
            [envelopeName, envelopeDescription, totalAmountUSD]
        );
        const res = await pgClient.query('SELECT id, name, description, total_amount_usd FROM envelopes WHERE name = $1 AND description = $2 AND total_amount_usd = $3;',
            [envelopeName, envelopeDescription, totalAmountUSD]
        );
        const resultObject = res.rows[0];
        requestedEnvelope = new Envelope (
            resultObject.id,
            resultObject.name,
            resultObject.description,
            resultObject.total_amount_usd
        );
        return requestedEnvelope;
    } catch (err) {
        // console.error(err.stack);
        throw err;
    }
};

const updateEnvelope = async (envelopeId, envelopeName, envelopeDescription, totalAmountUSD) => {
    try {
        // Query to update the database based on the given inputs
        await pgClient.query('UPDATE envelopes SET name = $1, description = $2, total_amount_usd = $3 WHERE id = $4;', 
            [envelopeName, envelopeDescription, totalAmountUSD, envelopeId]
        );
        
        // Fetch the updated row from the DB
        const res = await pgClient.query('SELECT id, name, description, total_amount_usd FROM envelopes WHERE id = $1;',
            [envelopeId]
        );
        // Check to see if there are any rows in the response, if not throw an error
        if (res.rows.length === 0) throw new Error('ID not in DB.');
        // Convert the fetched row into an instance of Envelope
        const resultObject = res.rows[0];
        requestedEnvelope = new Envelope (
            resultObject.id,
            resultObject.name,
            resultObject.description,
            resultObject.total_amount_usd
        );
        return requestedEnvelope;
    } catch (err) {
        // console.error(err.stack);
        throw err;
    }
};

const deleteEnvelope = async (envelopeId) => {
    try {
        // Query to delete the record from the DB
        await pgClient.query('DELETE FROM envelopes WHERE id = $1', [envelopeId]);
        return envelopeId;
    } catch (err) {
        throw err;
    }
};

/*
getEnvelopeById('cats')
    .then((res) => console.log(res))
    .catch((err) => console.error(err.stack));
*/

/*
createEnvelope('Savings', 'For saving', '$5,000.00')
    .then((res) => console.log(res))
    .catch((err) => console.error(err.stack));
*/

module.exports = { getEnvelopes, getEnvelopeById, createEnvelope, updateEnvelope, deleteEnvelope };