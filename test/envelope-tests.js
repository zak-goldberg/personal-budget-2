const app = require('../app');
const mocha = require('mocha');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const { validEnvelopeId } = require('../utils/utilities');

describe('envelopeRouter', () => {
    // Initializing variables used in envelopeRouter tests
    const validEnvelopeId = 1;
    const invalidEnvelopeId1 = '1500';
    const invalidEnvelopeId2 = 'ladksfihowefjks';
    let validEnvelopeObject = {
        envelopeName: 'Stuff',
        envelopeDescription: 'Description of stuff',
        totalAmountUSD: '$400.00'
    };
    const invalidEnvelopeObject = {
        property1: 'value1',
        property2: 'value2'
    };

    beforeEach(() => {
        validEnvelopeObject = {
            envelopeName: 'Stuff',
            envelopeDescription: 'Description of stuff',
            totalAmountUSD: '$400.00'
        };
    });

    describe('GET /envelopes', () => {
        
        it('should return a 200 status code', async () => {
            await request(app)
                .get('/envelopes')
                .expect(200)
        });
        
        it('should return an array', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes');

            // Verify
            expect(response.body).to.be.an('array');
        });
        
        it('should not be empty', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes');
            
            // Verify
            expect(response.body.length).to.be.greaterThan(0);
        });
        
        it('should return an array of plain envelope objects', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes');

            // Verify
            response.body.forEach((item) => {
                expect(item).to.have.all.keys('envelopeId', 'envelopeName', 'envelopeDescription', 'totalAmountUSD');
            });               
        });
    });
    
    describe('GET /envelopes/:envelopeId', () => {

        it('should return a 200 status code when passed a validEnvelopeId', async () => {
            await request(app)
                .get('/envelopes/' + validEnvelopeId)
                .expect(200);
        });
        
        it('should return an envelope when passed a valid id', async () => {
            // Exercise
            const response = await request(app)
                .get('/envelopes/' + validEnvelopeId)
                .expect(200);

            // Verify
            expect(response.body).to.have.all.keys('envelopeId', 'envelopeName', 'envelopeDescription', 'totalAmountUSD');
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            await request(app)
                .get('/envelopes/' + invalidEnvelopeId1)
                .expect(404);

            await request(app)
                .get('/envelopes/' + invalidEnvelopeId2)
                .expect(404);
        });
    });

    describe('POST /envelopes', () => {
        // TO-DO: Add teardown
        it('should return a 200 status code when passed a valid input', async () => {
            await request(app)
                .post('/envelopes')
                .send(validEnvelopeObject)
                .expect(200);
        });

        it('should persist a valid new envelope in the database', async () => {
            // Exercise
            // Create validEnvelopeObject
            const responsePost = await request(app)
                .post('/envelopes')
                .send(validEnvelopeObject)
                .expect(200);
            // console.log(responsePost.body);    

            // Save new id
            const newEnvelopeId = responsePost.body.envelopeId;
            // console.log(`newEnvelopeId: ${newEnvelopeId}`);
            // console.log(`typeof newEnvelopeId: ${typeof newEnvelopeId}`);

            // Verify
            // GET the new envelope from the database
            const responseGet = await request(app)
                .get('/envelopes/' + newEnvelopeId)
                .expect(200);

            // Add the newEnvelopeId to validEnvelopeObject in preparation for deep equal test
            validEnvelopeObject.envelopeId = newEnvelopeId;
            
            // Check that the new envelope object deeply equals the original object
            expect(responseGet.body).to.deep.equal(validEnvelopeObject);

            // Teardown
            // Delete new Envelope from the database
            // console.log(`newEnvelopeId: ${newEnvelopeId}`);
            // console.log(`typeof newEnvelopeId: ${typeof newEnvelopeId}`);
            await request(app)
                .delete('/envelopes/' + newEnvelopeId)
                .expect(204);
        });

        it('should return a 400 status code when passed an invalid input', async () => {
            await request(app)
                .post('/envelopes')
                .send(invalidEnvelopeObject)
                .expect(400);
        });
    });

    describe('PUT /envelopes/:envelopeId', () => {
        
        // Create variable to store envelope before updating it
        let originalEnvelopeObject;
        
        beforeEach( async () => {
            // Get current value for validEnvelopeId before updating it
            const beforeResponse = await request(app)
                .get('/envelopes/' + validEnvelopeId)
                .expect(200);

            originalEnvelopeObject = beforeResponse.body;
            // Remove id property
            delete originalEnvelopeObject.envelopeId;
        });

        afterEach( async () => {
            // Return validEnvelopeId to original value
            await request(app)
                .put('/envelopes/' + validEnvelopeId)
                .send(originalEnvelopeObject)
                .expect(200);
        });
        
        it('should return a 200 status code when passed a valid input', async () => {
            // Exercise
            await request(app)
                .put('/envelopes/' + validEnvelopeId)
                .send(validEnvelopeObject)
                .expect(200);
        });

        it('should persist changes to an envelope in the database', async () => {
            // Exercise
            // Create validEnvelopeObject
            await request(app)
                .put('/envelopes/' + validEnvelopeId)
                .send(validEnvelopeObject)
                .expect(200);

            // Verify
            // GET the new envelope from the database
            const responseGet = await request(app)
                .get('/envelopes/' + validEnvelopeId)
                .expect(200);

            // Add validEnvelopeId to validEnvelopeObject in preparation for deep equal test
            validEnvelopeObject.envelopeId = validEnvelopeId;
            
            // Check that the new envelope object deeply equals the original object
            expect(responseGet.body).to.deep.equal(validEnvelopeObject);
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            // Exercise
            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + invalidEnvelopeId1)
                .send(validEnvelopeObject)
                .expect(404);

            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + invalidEnvelopeId2)
                .send(validEnvelopeObject)
                .expect(404);
            
            // Invalid ID and Invalid body
            await request(app)
                .put('/envelopes/' + invalidEnvelopeId1)
                .send(invalidEnvelopeObject)
                .expect(404);
        });

        it('should return a 400 status code when passed an invalid input(body)', async () => {
            // Valid ID and Invalid body
            await request(app)
                .put('/envelopes/' + validEnvelopeId)
                .send(invalidEnvelopeObject)
                .expect(400);
        });
    });

    describe('DELETE /envelopes/:envelopeId', () => {
        let newEnvelopeId;
        
        beforeEach( async () => {
            // List all envelopes
            response = await request(app)
                .post('/envelopes')
                .send(validEnvelopeObject)
                .expect(200);
            
            // Get the id of the last envelope in the list
            newEnvelopeId = response.body.envelopeId;
        });

        afterEach( async () => {
            // console.log(JSON.stringify(lastEnvelope));
            // Add the removed envelope back
            /*
            await request(app)
                .post('/envelopes')
                .send(lastEnvelope)
                .expect(200);
            */    
        });

        it('should return a 200 status code when passed a valid input', async () => {
            await request(app)
                .delete('/envelopes/' + newEnvelopeId)
                .expect(204);
        });

        it('should remove the specified envelope form the database', async () => {
            // Exercise
            // Delete validEnvelopeObject
            await request(app)
                .delete('/envelopes/' + newEnvelopeId)
                .expect(204);

            // Verify
            // GET the new envelope from the database
            await request(app)
                .get('/envelopes/' + newEnvelopeId)
                .expect(404);
        });

        it('should return a 404 status code when passed an invalid id', async () => {
            // Exercise
            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + invalidEnvelopeId1)
                .expect(404);

            // Invalid ID and Valid body
            await request(app)
                .put('/envelopes/' + invalidEnvelopeId2)
                .expect(404);
        });

        it('should return a 400 status code when an envelope is deleted that has associated expenses', async () => {
            throw new Error(`Need expense APIs updated before writing this test.`);
        });
    });
});

