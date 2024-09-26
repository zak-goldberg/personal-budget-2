# Personal Budget Pt. 1

## Overview (Codecademy)
My solution for the Codecademy Personal Budget 1 Project. From Codecademy:
> For this project, you will build an API that allows clients to create and manage a personal budget. Using [Envelope Budgeting](https://www.thebalance.com/what-is-envelope-budgeting-1293682) principles, your API should allow users to manage budget envelopes and track the balance of each envelope. Your API should follow best practices regarding REST endpoint naming conventions, proper response codes, etc. Make sure to include data validation to ensure users do not overspend their budget!

## Project Objectives (Codecademy)
- Build an API using **Node.js** and **Express**
- Be able to create, read, update, and delete envelopes
- Create endpoint(s) to update envelope balances
- Use **Git** version control to keep track of your work
- Use the command line to navigate your files and folders
- Use **Postman** to test API endpoints

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
1. The "database" (an array), needs to be initialized in a distinct file and imported into any of the files that use it. This is a best practice for seperation of concerns and Node will throw a circular dependency warning if this isn't followed (assuming those files depend on eachother).
2. JavaScript treats the number 0 as falsy!
3. To maintain proper encapsulation, the API handlers need to convert the class instances with private properties to a plain object before sending back to the client.
4. PUT APIs are idempotent. POST APIs are not idempotent.
5. You can perform arithmetic on properties accessed via getter/setter methods.
6. Apply request/reply logging, cors, and body parsing at the global app level, not the routing level, to avoid duplicate execution.
7. Response body is deleted when status code is set to 204.

## TO-DO (Me)
- Break validation methods in setters (class-definitions.js) into generic utility functions
- Remove envelopeId from the request body of POST envelopes/:envelopeId/expenses since it is already a parameter in the path
- Test edge cases, not just happy path.
- Organize the file structure and update import statements.