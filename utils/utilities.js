// Import getEnvelopeById repository function
const { getEnvelopeById } = require('../repositories/envelopeRepositories.js');

// Convert currency string to number
const parseCurrency = (currencyStr) => {
    // Remove dollar symbol and commas
    const numStr = currencyStr.replace(/[$,]/g, '');
    // Convert to float
    return parseFloat(numStr);
};

// Format number as currency string
const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
};

// Arithmetic operations on currency strings
const currencyArithmetic = {
    add: (a, b) => formatCurrency(parseCurrency(a) + parseCurrency(b)),
    subtract: (a, b) => formatCurrency(parseCurrency(a) - parseCurrency(b))
    };

// Helper function to validate envelope based on the schema
const validEnvelope = (envelope) => {
      if (
          envelope.envelopeName && typeof envelope.envelopeName === 'string'
          && envelope.envelopeDescription && typeof envelope.envelopeDescription === 'string'
          && envelope.totalAmountUSD !== null
      ) {
      return true;
    } else {
      return false;
    }
  };

// Helper function to convert instances of the envelope class to a plain object
function convertEnvelopeToPlain(envelope) {
    if (validEnvelope(envelope)) {
        const plainEnvelope = {};
        plainEnvelope.envelopeId = envelope.envelopeId;
        plainEnvelope.envelopeName = envelope.envelopeName;
        plainEnvelope.envelopeDescription = envelope.envelopeDescription;
        plainEnvelope.totalAmountUSD = envelope.totalAmountUSD;
        return plainEnvelope;
    } else {
        throw new Error('Failed to convert. Not a valid envelope.');
    }
};

// Helper function to validate transfer request
const validTransferRequest = async (transferReq) => {
    const { sourceEnvelopeId, targetEnvelopeId, transferAmount } = transferReq;
    // Validate that the transfer amount
    if (Number.isNaN(parseCurrency(transferAmount))) throw new Error ('Please enter a valid transfer amount.');
    // Create binding for the source envelope since the value is assigned in a try block
    let sourceEnvelope;
    try {
        // Use helper function to get the envelope for the sourceEnvelopeId in the request
        sourceEnvelope = await getEnvelopeById(sourceEnvelopeId);
    } catch (err) {
        throw err;
    }
    try {
        // Use helper function to get the envelope for the targetEnvelopeId in the request
        await getEnvelopeById(targetEnvelopeId)
    } catch (err) {
        throw err;
    }
    // Validate that the transfer amount **is not** greater than the total amount in the source envleope, if not throw descriptive error
    if (parseCurrency(transferAmount) >= parseCurrency(sourceEnvelope.totalAmountUSD)) throw new Error('Transfer amount is greater than source budget.');
    // If the request passes all validations, return true
    return true;
};

// Helper function to validate a new expense object
const validExpense = (expense) => {
    if (
        expense.expenseDescription && typeof expense.expenseDescription === 'string'
        && expense.expenseAmountUSD !== null 
        && expense.envelopeId !== null
    ) {
    return true;
  } else {
    return false;
  }
};

// Helper function to convert instances of the envelope class to a plain object
function convertExpenseToPlain(expense) {
    // Check that the provided expense is valid
    if (validExpense(expense)) {
        const plainExpense = {};
        plainExpense.expenseId = expense.expenseId;
        plainExpense.expenseDescription = expense.expenseDescription;
        plainExpense.expenseAmountUSD = expense.expenseAmountUSD;
        plainExpense.envelopeId = expense.envelopeId;
        return plainExpense;
    } else {
        throw new Error('Failed to convert. Not a valid expense.');
    }
};

module.exports = { validEnvelope, convertEnvelopeToPlain, validTransferRequest, validExpense, convertExpenseToPlain, currencyArithmetic, parseCurrency, formatCurrency };