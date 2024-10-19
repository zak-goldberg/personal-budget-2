const app = require('../app');
const mocha = require('mocha');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const { validEnvelopeId } = require('../utils/utilities');

describe('expenseRouter', () => {
    // Initialize variables that will be used in tests below
    const validEnvelopeId = 1;
    const validExpenseObject = {
        expenseName: "Waffles",
        expenseDescription: "Really tasty waffles.",
        expenseAmountUSD: "$5.00",
        envelopeId: validEnvelopeId
    };
    const validExpenseObject2 = {
        expenseName: "CrispyWaffles",
        expenseDescription: "Really crispy waffles.",
        expenseAmountUSD: "$6.00",
        envelopeId: validEnvelopeId
    }
    let newExpenseId;
    const invalidExpenseId1 = 60000000000;
    const invalidExpenseId2 = 'slanfewhushkfjnweuifhweoifaoweijf';
    const invalidExpenseObject = {
        property1: 'value1',
        property2: 'value2'
    };

    before(async () => {
        // Get valid expenses
        const response = await request(app)
            .post('/envelopes/' + validEnvelopeId + '/expenses/')
            .send(validExpenseObject)
            .expect(200);

        newExpenseId = response.body.expenseId;
    });

    describe('GET /envelopes/:envelope_id/expenses', () => {
        it('should return a 200 status code', async () => {
            await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses')
                .expect(200);
        });
        
        it('should return an array', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses')
                .expect(200);

            // Verify
            expect(response.body).to.be.an('array');
        });
        
        it('should not be empty', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses')
                .expect(200);
            
            // Verify
            expect(response.body.length).to.be.greaterThan(0);
        });
        
        it('should return an array of plain envelope objects', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses')
                .expect(200);

            // Verify
            response.body.forEach((item) => {
                expect(item).to.have.all.keys('expenseId', 'expenseName', 'expenseDescription', 'expenseAmountUSD', 'envelopeId');
            });               
        });
    });

    describe('GET /envelopes/:envelope_id/expenses/:expense_id', () => {
        it('should return a 200 status code when passed a validEnvelopeId', async () => {
            await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .expect(200);
        });
        
        it('should return an envelope when passed a valid id', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .expect(200);

            // Verify
            expect(response.body).to.have.all.keys('envelopeId', 'envelopeName', 'envelopeDescription', 'totalAmountUSD');
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            await request(app)
                .get('/envelopes/' + invalidExpenseId1)
                .expect(404);

            await request(app)
                .get('/envelopes/' + invalidExpenseId2)
                .expect(404);
        });
    });

    describe('POST /envelopes/:envelope_id/expenses', () => {
        // TO-DO: Add teardown
        it('should return a 200 status code when passed a valid input', async () => {
            await request(app)
                .post('/envelopes/' + validEnvelopeId + '/expenses')
                .send(validExpenseObject)
                .expect(200);
        });

        it('should persist a valid new envelope in the database', async () => {
            // Exercise
            // Create validEnvelopeObject
            const responsePost = await request(app)
            .post('/envelopes/' + validEnvelopeId + '/expenses')
            .send(validExpenseObject)
            .expect(200);
            // console.log(responsePost.body);    

            // Save new id
            const newExpenseId2 = responsePost.body.envelopeId;
            // console.log(`newEnvelopeId: ${newEnvelopeId}`);
            // console.log(`typeof newEnvelopeId: ${typeof newEnvelopeId}`);

            // Verify
            // GET the new envelope from the database
            const responseGet = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId2)
                .expect(200);

            // Add the newEnvelopeId to validEnvelopeObject in preparation for deep equal test
            validExpenseObject.expenseId = newExpenseId2;
            
            // Check that the new envelope object deeply equals the original object
            expect(responseGet.body).to.deep.equal(validExpenseObject);

            // Teardown
            // Delete new Envelope from the database
            // console.log(`newEnvelopeId: ${newEnvelopeId}`);
            // console.log(`typeof newEnvelopeId: ${typeof newEnvelopeId}`);
            await request(app)
                .delete('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId2)
                .expect(204);
        });

        it('should return a 400 status code when passed an invalid input', async () => {
            await request(app)
                .post('/envelopes/' + validEnvelopeId + '/expenses')
                .send(invalidExpenseObject)
                .expect(400);
        });
    });

    describe('PUT /envelopes/:envelope_id/expenses/:expense_id', () => {
        
        // Create variable to store expense before updating it
        let originalExpenseObject;
        
        beforeEach( async () => {
            // Get current value for newExpenseId before updating it
            const beforeResponse = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .expect(200);

            originalExpenseObject = beforeResponse.body;
            // Remove expenseId property
            delete originalExpenseObject.expenseId;
        });

        afterEach( async () => {
            // Return validExpenseId to original value
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .send(originalExpenseObject)
                .expect(200);
        });
        
        it('should return a 200 status code when passed a valid input', async () => {
            // Exercise
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .send(validExpenseObject2)
                .expect(200);
        });

        it('should persist changes to an envelope in the database', async () => {
            // Exercise
            // Create validEnvelopeObject
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .send(validExpenseObject2)
                .expect(200);

            // Verify
            // GET the new envelope from the database
            const responseGet = await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .expect(200);

            // Add newExpenseId to validExpenseObject2 in preparation for deep equal test
            validExpenseObject2.expenseId = newExpenseId;
            
            // Check that the new envelope object deeply equals the original object
            expect(responseGet.body).to.deep.equal(validExpenseObject2);
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            // Exercise
            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + invalidExpenseId1)
                .send(validExpenseObject)
                .expect(404);

            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + invalidExpenseId2)
                .send(validExpenseObject)
                .expect(404);
            
            // Invalid ID and Invalid body
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + invalidExpenseId2)
                .send(invalidExpenseObject)
                .expect(404);
        });

        it('should return a 400 status code when passed an invalid input(body)', async () => {
            // Valid ID and Invalid body
            await request(app)
                .put('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId)
                .send(invalidExpenseObject)
                .expect(400);
        });
    });

    describe('DELETE /envelopes/:envelope_id/expenses/:expense_id', () => {
        let newExpenseId2;
        
        beforeEach( async () => {
            // Create new expense 2
            const response = await request(app)
                .post('/envelopes/' + validEnvelopeId + '/expenses/')
                .send(validExpenseObject)
                .expect(200);

            newExpenseId2 = response.body.expenseId;
        });

        it('should return a 200 status code when passed a valid input', async () => {
            await request(app)
                .delete('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId2)
                .expect(204);
        });

        it('should remove the specified expense form the database', async () => {
            // Exercise
            // Delete validEnvelopeObject
            await request(app)
                .delete('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId2)
                .expect(204);

            // Verify
            // GET the new envelope from the database
            await request(app)
                .get('/envelopes/' + validEnvelopeId + '/expenses/' + newExpenseId2)
                .expect(404);
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            // Exercise
            // Invalid ID number
            await request(app)
                .put('/envelopes/' + invalidExpenseId1)
                .expect(404);

            // Invalid ID string
            await request(app)
                .put('/envelopes/' + invalidExpenseId1)
                .expect(404);
        });
    });
});