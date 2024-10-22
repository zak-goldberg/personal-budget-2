// Import in envelope and expense arrays
const { envelopeArray, expenseArray } = require('../test/the-database-lol.js');

// Import getEnvelopeById repository function
const { getEnvelopeById } = require('../repositories/envelopeRepositories.js');

// Convert currency string to number
const parseCurrency = (currencyStr) => {
    // Remove currency symbol, commas and whitespace
    const numStr = currencyStr.replace(/[$,]/g, '');
    // Convert to number, handles negative values too
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

const currencyStr1 = '$500.00'
const currencyStr2 = '$400.00'
const currencyStr3 = formatCurrency(parseCurrency(currencyStr1) / 2);
const currencyStr4 = formatCurrency(parseCurrency(currencyStr2) / 2);

console.log(`parseCurrency(currencyStr1): ${parseCurrency(currencyStr1)}`);
console.log(`parseCurrency(currencyStr2): ${parseCurrency(currencyStr2)}`);
console.log(`parseCurrency(currencyStr1) / 2: ${parseCurrency(currencyStr1) / 2}`);
console.log(`parseCurrency(currencyStr2) / 2: ${parseCurrency(currencyStr2) / 2}`);
console.log(`formatted: parseCurrency(currencyStr1) / 2: ${formatCurrency(parseCurrency(currencyStr1) / 2)}`);
console.log(`formatted: parseCurrency(currencyStr2) / 2: ${formatCurrency(parseCurrency(currencyStr2) / 2)}`);
console.log(`currencyArithmetic.subtract: ${currencyArithmetic.add(currencyStr3, currencyStr4)}`);

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
const validTransferRequest = async (transferReq) => {
    const sourceEnvelopeId = transferReq.sourceEnvelopeId;
    const targetEnvelopeId = transferReq.targetEnvelopeId;
    const transferAmount = transferReq.transferAmount;
    if (Number.isNaN(parseCurrency(transferAmount))) throw new Error ('Please enter a valid transfer amount.');
    let sourceEnvelope;
    try {
        sourceEnvelope = await getEnvelopeById(sourceEnvelopeId);
    } catch (err) {
        throw err;
    }
    try {
        await getEnvelopeById(targetEnvelopeId)
    } catch (err) {
        throw err;
    }
    console.log(`transferAmount: ${parseCurrency(transferAmount)}`);
    console.log(`sourceEnvelope.totalAmountUSD: ${parseCurrency(sourceEnvelope.totalAmountUSD)}`);
    console.log(`>=: ${parseCurrency(transferAmount) >= parseCurrency(sourceEnvelope.totalAmountUSD)}`);
    if (parseCurrency(transferAmount) >= parseCurrency(sourceEnvelope.totalAmountUSD)) throw new Error('Transfer amount is greater than source budget.');
    return true;
};

// Helper function to get expense by envelope Id
/*
const getExpensesByEnvelopeId = (envelopeId) => {
    if (validEnvelopeId(Number(envelopeId))) {
        const filteredExpenses = expenseArray.filter((expense => Number(expense.envelopeId) === Number(envelopeId)));
        return filteredExpenses;
    } else {
        throw new Error('Please enter a valid envelope id.');
    }
};
*/

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

// Helper function to validate expense ids
function validExpenseId(expenseId) {
    const arrayOfIds = expenseArray.reduce((accumulator, currentValue) => {
        accumulator.push(currentValue.expenseId);
        return accumulator;
    }, []);
    if (arrayOfIds.includes(expenseId)) return true;
    return false;
}

module.exports = { validEnvelope, convertEnvelopeToPlain, validTransferRequest, getEnvelopeIndex, validExpense, convertExpenseToPlain, validExpenseId, currencyArithmetic, parseCurrency, formatCurrency };