const app = require('../app');
const mocha = require('mocha');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;

// Import in utility functions
const { currencyArithmetic, parseCurrency, formatCurrency } = require('../utils/utilities');

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
        originalEnvelopeSource = allEnvelopesResponse.body[0];
        console.log(`originalEnvelopeSource: ${JSON.stringify(originalEnvelopeSource)}`);

        originalEnvelopeTarget = allEnvelopesResponse.body[1];
        console.log(`originalEnvelopeTarget: ${JSON.stringify(originalEnvelopeTarget)}`);

        // Set valid transfer amount
        const validTransferAmount = formatCurrency(parseCurrency(originalEnvelopeSource.totalAmountUSD) / 2);
        console.log(`validTransferAmount: ${validTransferAmount + ' ' + typeof validTransferAmount}`);

        // Set invalid transfer amount
        const invalidTransferAmount = formatCurrency(parseCurrency(originalEnvelopeSource.totalAmountUSD) * 3);
        console.log(`invalidTransferAmount: ${invalidTransferAmount + ' ' + typeof invalidTransferAmount}`);

        // Construct validTransferRequest
        validTransferRequest = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // Construct transfer request to return to original state
        validTransferRequestReverse = {
            "sourceEnvelopeId": originalEnvelopeTarget.envelopeId,
            "targetEnvelopeId": originalEnvelopeSource.envelopeId,
            "transferAmount": validTransferAmount
        };

        // Construct invalid transfer requests with invalid envelopeIds
        // sourceEnvelopeId invalid type
        invalidTransferRequestId1 = {
            "sourceEnvelopeId": "laksdfnoweiuhnsdc",
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // sourceEnvelopeId out of range
        invalidTransferRequestId2 = {
            "sourceEnvelopeId": -4,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": validTransferAmount
        };

        // targetEnvelopeId invalid type
        invalidTransferRequestId3 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": "laksdfnoweiuhnsdc",
            "transferAmount": validTransferAmount
        };

        // targetEnvelopeId out of range
        invalidTransferRequestId4 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": -4,
            "transferAmount": validTransferAmount
        };

        // Construct invalid transfer requests with invalid amounts
        // invalid type
        invalidTransferRequestAmount1 = {
            "sourceEnvelopeId": originalEnvelopeSource.envelopeId,
            "targetEnvelopeId": originalEnvelopeTarget.envelopeId,
            "transferAmount": "laksdfnoweiuhnsdc"
        };

        // invalid value
        invalidTransferRequestAmount2 = {
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
            console.log(`resEnvelopeSource: ${JSON.stringify(resEnvelopeSource.body)}`);

            const afterEnvelopeSourceAmount = resEnvelopeSource.body.totalAmountUSD;
            console.log(`afterEnvelopeSourceAmount: ${typeof afterEnvelopeSourceAmount, afterEnvelopeSourceAmount}`);

            // GET request for envelope transfered to
            const resEnvelopeTarget = await request(app)
                .get('/envelopes/' + originalEnvelopeTarget.envelopeId)
                .expect(200);
            console.log(`resEnvelopeTarget: ${JSON.stringify(resEnvelopeTarget.body)}`);

            const afterEnvelopeTargetAmount = resEnvelopeTarget.body.totalAmountUSD;
            console.log(`afterEnvelopeTargetAmount: ${typeof afterEnvelopeTargetAmount, afterEnvelopeTargetAmount}`);

            // Verify
            // Source envelope is correctly updated
            // Chai v4.3.8 uses strict equality for .equal()
            expect(afterEnvelopeSourceAmount).to.equal(currencyArithmetic.subtract(originalEnvelopeSource.totalAmountUSD, validTransferRequest.transferAmount));

            // Target envelope is correctly updated
            // Chai v4.3.8 uses strict equality for .equal()
            expect(afterEnvelopeTargetAmount).to.equal(currencyArithmetic.add(originalEnvelopeTarget.totalAmountUSD, validTransferRequest.transferAmount));

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