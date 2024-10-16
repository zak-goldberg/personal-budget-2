# Personal Budget Pt. 2

## Overview (Codecademy)
You will extend the Personal Budget API created in [Personal Budget, Part I](https://github.com/zak-goldberg/Personal-Budget-1). In the first Budget API, we did not have a way to persist data on the server. Now, we will build out a persistence layer (aka a database or DB) to keep track of the budget envelopes and their balances. You will need to plan out your database design, then use PostgreSQL to create the necessary tables. Once your database is set up, connect your API calls to a database. Once you’ve added and connected your database, you will add a new feature to your server that allows users to enter transactions. This feature will put your envelope system into action! Finally, you will make your API available for others to use by documenting it with Swagger and deploying it with Render.

## Project Objectives (Codecademy)
- Use Git version control
- Create documentation using the Swagger API
- Implement a database
- Integrate existing API endpoints with the database layer
- Database implementation for transactions
- Deploy the application using Render

## Assumptions (Me)
- One to one mapping between envelopes & expenses

## Schemas (Me)
### Envelopes
- envelopeId (Number) - *READ-ONLY*
- envelopeName (String)
- envelopeDescription (String)
- budgetedValueUSD (Number)
- totalSpentUSD (Number)
- budgetRemainingUSD (Number) - *COMPUTED*

**Example object:**
``` JSON
{
    "envelopeId": 1,
    "envelopeName": "Entertainment",
    "envelopeDescription": "Song and dance",
    "budgetedValueUSD": 200,
    "totalSpentUSD": 2
}
```
### Expenses
- expenseId (Number) - *READ-ONLY*
- expenseName (String)
- expenseDescription (String)
- expenseAmountUSD (Number)
- envelopeId (Number) - *READ-ONLY*

**Example object:**
``` JSON
{
  "expenseId": 1,
  "expenseName": "Waffles",
  "expenseDescription": "Really tasty waffles.",
  "expenseAmountUSD": 5,
  "envelopeId": 1
}
```
## APIs (Me)
### Envelopes
- listEnvelopes - GET /envelopes
- getEnvelopeById - GET /envelopes/:envelope_id
- createEnvelope - POST /envelopes, request body:
``` JSON
// Sample request body for createEnvelope
{
    "envelopeName": "Entertainment", // String
    "envelopeDescription": "Song and dance", // String
    "budgetedValueUSD": 200, // Number
    "totalSpentUSD": 2 // Number
}
```
- updateEnvelopeById - PUT /envelopes/:envelope_id
  - Can only update name, description, and budgeted_value_USD
  - To update totalSpentUSD, use POST or PUT /envelopes/:envelopeId/expenses/
``` JSON
// Sample request body for updateEnvelopeById
{
    "envelopeId": 1, // Number, READ-ONLY
    "envelopeName": "Entertainment", // String
    "envelopeDescription": "Song and dance", // String
    "budgetedValueUSD": 200, // Number
    "totalSpentUSD": 2 // Number, Can't be updated by this API
}
```
- deleteEnvelopeById - DELETE /envelopes/:envelope_id
- transferBudget - POST /transfers
``` JSON
// Sample request body for transferBudget
{
  "sourceEnvelopeId": 1, // Number,
  "targetEnvelopeId": 2, // Number,
  "transferAmount": 500 // Number (less than source envelope budgetedValueUSD)
}
```
### Expenses
- listExpenses - GET /envelopes/:envelope_id/expenses
- getExpenseById - GET /envelopes/:envelope_id/expenses/:expense_id
- createExpense - POST /envelopes/:envelope_id/expenses
``` JSON
// Sample request body for createExpense
{
  "expenseName": "Waffles", // String
  "expenseDescription": "Really tasty waffles.", // String
  "expenseAmountUSD": 5, // Number
  "envelopeId": 1 // Number
}
```
- updateExpenseById - PUT /envelopes/:envelope_id/expenses/:expense_id
``` JSON
// Sample request body for updateExpenseById
{
  "expenseId": 1, // Number - READ-ONLY
  "expenseName": "Waffles", // String
  "expenseDescription": "Really tasty waffles.", // String
  "expenseAmountUSD": 5, // Number - Must be less than the budgetedValueUSD of the corresponding envelope
  "envelopeId": 1 // Number
}
```
- deleteExpenseById - DELETE /envelopes/:envelope_id/expenses/:expense_id

## Additional Components (Me)
- Class definitions for Envelope and Expense (class-definitions.js)
- Parameter middleware functions to validate `:envelope_id` and `:expense_id` (parameter-middleware.js)
- Utility functions (utilities.js):
  - validEnvelope
  - convertEnvelopeToPlain (see #3 [here](#Roadblocks-&-Learnings-(Me)))
  - validEnvelopeId
  - getEnvelopeIndex
  - validTransferRequest
  - getExpensesByEnvelopeId
  - validExpense
  - convertExpenseToPlain
  - validExpenseId
- Generic error handler function (generic-error-handler.js)

## Roadblocks & Learnings (Me)

## TO-DO (Me)
