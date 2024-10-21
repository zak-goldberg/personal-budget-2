const app = require('../app');
const mocha = require('mocha');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

describe('transferRouter', () => {
    let validTransferRequest;
    let validTransferRequestReverse;
    let originalEnvelopeSource;
    let originalEnvelopeTarget;
    let invalidTransferRequestId1;
    let invalidTransferRequestId2;
    let invalidTransferRequestId3;
    let invalidTransferRequestId4;
    let invalidTransferRequestAmount1;
    let invalidTransferRequestAmount2;

    
    before(async () => {
        // GET request to list all envelopes
        const allEnvelopesResponse = await request(app)
            .get('/envelopes')
            .expect(200);

        // Pick 2 valid envelopes
        const originalEnvelopeSource = allEnvelopesResponse.body[0];

        const originalEnvelopeTarget = allEnvelopesResponse.body[1];

        // Set valid transfer amount
        const validTransferAmount = originalEnvelopeSource.totalAmountUSD / 2;

        // Set invalid transfer amount
        const invalidTransferAmount = originalEnvelopeSource.totalAmountUSD * 3;

        // Construct validTransferRequest
        const validTransferRequest = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // Construct transfer request to return to original state
        const validTransferRequestReverse = {
            "sourceEnvelopeId": originalEnvelopeTarget.envelopeId,
            "targetEnvelopeId": originalEnvelopeSource.envelopeId,
            "transferAmount": validTransferAmount
        };

        // Construct invalid transfer requests with invalid envelopeIds
        // sourceEnvelopeId invalid type
        const invalidTransferRequestId1 = {
            "sourceEnvelopeId": "laksdfnoweiuhnsdc",
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // sourceEnvelopeId out of range
        const invalidTransferRequestId2 = {
            "sourceEnvelopeId": -4,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // targetEnvelopeId invalid type
        const invalidTransferRequestId3 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": "laksdfnoweiuhnsdc",
            "transferAmount": validTransferAmount
        };

        // targetEnvelopeId out of range
        const invalidTransferRequestId4 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": -4,
            "transferAmount": validTransferAmount
        };

        // Construct invalid transfer requests with invalid amounts
        // invalid type
        const invalidTransferRequestAmount1 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": "laksdfnoweiuhnsdc"
        };

        // invalid value
        const invalidTransferRequestAmount2 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": invalidTransferAmount
        };
    });

    describe('POST /transfers', () => {

        it('should return a 200 status code when passed a valid input', async () => {
            // Valid transfer request
            await request(app)
                .post('/transfers')
                .send(validTransferRequest)
                .expect(200);

            // Teardown
            // Reverse valid transfer request
            await request(app)
                .post('/transfers')
                .send(validTransferRequestReverse)
                .expect(200);
        });

        it('should persist the transfer changes in the database', async () => {
            // Exercise
            // Post request with valid body
            await request(app)
                .post('/transfers')
                .send(validTransferRequest)
                .expect(200);

            // GET request for envelope transfered from 
            const resEnvelopeSource = await request(app)
                .get('/envelopes/' + originalEnvelopeSource.envelopeId)
                .expect(200);

            const afterEnvelopeSourceAmount = resEnvelopeSource.body.totalAmountUSD;

            // GET request for envelope transfered to
            const resEnvelopeTarget = await request(app)
                .get('/envelopes/' + originalEnvelopeTarget.envelopeId)
                .expect(200);

            const afterEnvelopeTargetAmount = resEnvelopeTarget.body.totalAmountUSD;

            // Verify
            // Source envelope is correctly updated
            expect(afterEnvelopeSourceAmount).to.strict.equal(originalEnvelopeSource.totalAmountUSD - validTransferRequest.transferAmount);

            // Target envelope is correctly updated
            expect(afterEnvelopeTargetAmount).to.strict.equal(originalEnvelopeTarget.totalAmountUSD + validTransferRequest.transferAmount);

            // Teardown
            // Reverse valid transfer request
            await request(app)
                .post('/transfers')
                .send(validTransferRequestReverse)
                .expect(200);
        });

        it('should return a 404 status code when passed an invalid envelopeId', async () => {
            // Exercise & Verify
            // POST to /transfers with request body including invalid transfer id (**from** is invalid type)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestId1)
                .expect(404);

            // POST to /transfers with request body including invalid transfer id (**from** is out of range)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestId2)
                .expect(404);

            // POST to /transfers with request body including invalid transfer id (**to** is invalid type)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestId3)
                .expect(404);
        
            // POST to /transfers with request body including invalid transfer id (**to** is out of range)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestId4)
                .expect(404);
        });

        it('should return a 400 status code when passed an invalid transferAmount', async () => {
            // Exercise & Verify
            // POST to /transfers with request body including invalid transfer amounts (invalid type)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestAmount1)
                .expect(400);
            
            // POST to /transfers with request body including invalid transfer amounts (invalid amount)
            await request(app)
                .post('/transfers')
                .send(invalidTransferRequestAmount2)
                .expect(400);
        });
    });
});