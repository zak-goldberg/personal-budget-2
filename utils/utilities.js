// Import in envelope and expense arrays
const { envelopeArray, expenseArray } = require('../test/the-database-lol.js');

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

// Helper function to validate envelopeId
/*
const validEnvelopeId = (envelopeId) => {
    const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.envelopeId);
        return(accumulator);
    }, []);
    // console.log(arrayOfIds);
    if (arrayOfIds.includes(Number(envelopeId))) return true;
    return false;
}
*/    

// Helper function to getEnvelopeIndex
const getEnvelopeIndex = (envelopeId) => {
    const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.envelopeId);
        return(accumulator);
    }, []);
    const envelopeIndex = arrayOfIds.indexOf(Number(envelopeId));
    return envelopeIndex;
}

// Helper function to validate transfer request
const validTransferRequest = (transferReq) => {
    const sourceEnvelopeId = transferReq.sourceEnvelopeId;
    const targetEnvelopeId = transferReq.targetEnvelopeId;
    const transferAmount = transferReq.transferAmount;
    if (!validEnvelopeId(Number(sourceEnvelopeId))) throw new Error('Please enter a valid source envelope id.');
    if (!validEnvelopeId(Number(targetEnvelopeId))) throw new Error('Please enter a valid target envelope id.');
    if (Number.isNaN(Number(transferAmount))) throw new Error('Please enter a valid number for the transfer amount.');
    const arrayOfIds = envelopeArray.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.envelopeId);
        return(accumulator);
    }, []);
    const sourceEnvelopeIndex = arrayOfIds.indexOf(Number(sourceEnvelopeId));
    const sourceBudget = envelopeArray[sourceEnvelopeIndex].budgetedValueUSD;
    if (Number(transferAmount) > Number(sourceBudget)) throw new Error('Transfer amount is greater than source budget.');
    return true;
};

// Helper function to get expense by envelope Id
const getExpensesByEnvelopeId = (envelopeId) => {
    if (validEnvelopeId(Number(envelopeId))) {
        const filteredExpenses = expenseArray.filter((expense => Number(expense.envelopeId) === Number(envelopeId)));
        return filteredExpenses;
    } else {
        throw new Error('Please enter a valid envelope id.');
    }
};

// Helper function to validate a new expense object
const validExpense = (expense) => {
    if (
        expense.expenseName && typeof expense.expenseName === 'string'
        && expense.expenseDescription && typeof expense.expenseDescription === 'string'
        && expense.expenseAmountUSD !== null && !Number.isNaN(Number(expense.expenseAmountUSD))
        && expense.envelopeId !== null && validEnvelopeId(Number(expense.envelopeId))
    ) {
    return true;
  } else {
    return false;
  }
};

// Helper function to convert instances of the envelope class to a plain object
function convertExpenseToPlain(expense) {
    if (validExpense(expense)) {
        const plainExpense = {};
        plainExpense.expenseId = expense.expenseId;
        plainExpense.expenseName = expense.expenseName;
        plainExpense.expenseDescription = expense.expenseDescription;
        plainExpense.expenseAmountUSD = expense.expenseAmountUSD;
        plainExpense.envelopeId = expense.envelopeId;
        return plainExpense;
    } else {
        throw new Error('Failed to convert. Not a valid expense.');
    }
};

// Helper function to validate expense ids
function validExpenseId(expenseId) {
    const arrayOfIds = expenseArray.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.expenseId);
        return accumulator;
    }, []);
    if (arrayOfIds.includes(expenseId)) return true;
    return false;
}

module.exports = { validEnvelope, convertEnvelopeToPlain, validTransferRequest, getEnvelopeIndex, getExpensesByEnvelopeId, validExpense, convertExpenseToPlain, validExpenseId }