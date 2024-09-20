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
- envelope_id (Number)
- envelope_name (String)
- envelope_description (String)
- budgeted_value_USD (Number)
- total_spent_USD (Number)
- budget_remaining_USD (Number) - *COMPUTED*
**Example object:**
``` JS
{
  envelope_id: 1,
  envelope_name: 'Groceries',
  envelope_description: 'For food and related goods',
  budgeted_value_USD: 450,
  total_spent_USD: 200
}
```
### Expenses
- expense_id (Number)
- expense_name (String)
- expense_description (String)
- expense_amount_USD (Number)
- envelope_id (Number)
- envelope_name (String)
**Example object:**
``` JS
{
  expense_id: 1,
  expense_name: 'Waffles',
  expense_description: Null,
  expense_amount_USD: 5,
  envelope_id: 1,
  envelope_name: 'Groceries'
}
```
## APIs (Me)
### Envelopes
- listEnvelopes - GET /envelopes
- getEnvelopeById - GET /envelopes/:envelope_id
- createEnvelope - POST /envelopes
- updateEnvelopeById - PUT /envelopes/:envelope_id
  - Can only update name, description, and budgeted_value_USD
- deleteEnvelopeById - DELETE /envelopes/:envelope_id
### Expenses
- listExpenses - GET /envelopes/:envelope_id/expenses
- getExpenseById - GET /envelopes/:envelope_id/expenses/:expense_id
- createExpense - POST /envelopes/:envelope_id/expenses
- updateExpenseById - PUT /envelopes/:envelope_id/expenses/:expense_id
- deleteExpenseById - DELETE /envelopes/:envelope_id/expenses/:expense_id

## Additional Components (Me)
- Parameter middleware functions to validate `:envelope_id` and `:expense_id`
- Middleware function to compute budget_remaining_USD for:
  - listEnvelopes - GET /envelopes
  - getEnvelopeById - GET /envelopes/:envelope_id
  - updateEnvelopeById - PUT /envelopes/:envelope_id
- Middleware function with logic to update relevant envelope for:
  - createExpense
  - updateExpenseById
  - deleteExpenseById

## Roadblocks & Learnings (Me)
- TBD