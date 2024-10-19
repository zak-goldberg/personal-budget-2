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
    } catch (err) {
        // console.error(err.stack);
        throw err;
    }
    return requestedEnvelope;
};

/*
getEnvelopeById('cats')
    .then((res) => console.log(res))
    .catch((err) => console.error(err.stack));
*/

module.exports = { getEnvelopes, getEnvelopeById };