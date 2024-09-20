class Envelope {
    static lastEnvelopeId = 0;
    
    constructor(envelopeName, envelopeDescription, budgetedValueUSD, totalSpentUSD) {
        Envelope.lastEnvelopeId += 1;        
        this._envelopeId = Envelope.lastId;
        this._envelopeName = envelopeName;
        this._envelopeDescription = envelopeDescription;
        this._budgetedValueUSD = budgetedValueUSD;
        this._totalSpentUSD = totalSpentUSD;
    }

// Getter for envelope id (read-only)
    get envelopeId () {
        return this.envelopeId
    }

// Getter, setter, and validation method for _envelopeName    
    get envelopeName() {
        return this._envelopeName;
    }
    
    validateEnvelopeName(name) {
        if (typeof name !== 'string') throw new Error('Please enter a valid string for a name'); 
        if (name.length >= 30) throw new Error('Name length must be less than or equal to 30 characters');
        if (!/^[a-zA-Z]+$/.test(name)) throw new Error('Name can only include letters. No numbers, spaces, or special characters.');
    }
    
    set envelopeName(name) {
        try {
            this.validateEnvelopeName(name);
            this._envelopeName = name;
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }

// Getter, setter, and validation for envelopeDescription
    get envelopeDescription() {
        return this._envelopeDescription;
    }
    
    validateEnvelopeDescription(name) {
        if (typeof name !== 'string') throw new Error('Please enter a valid string for a name.'); 
        if (name.length >= 100) throw new Error('Name length must be less than or equal to 30 characters.');
        if (!/^[a-zA-Z\s]+\.?$/.test(name)) throw new Error('Name can only include letters. No numbers, spaces, or special characters.');
    }
    
    set envelopeDescription(description) {
        try {
            this.validateEnvelopeDescription(description);
            this._envelopeDescritpion = description;
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }

// Getter, setter, and validation for budgetedValueUSD
    get budgetedValueUSD() {
        return this._budgetedValueUSD;
    }

    validateBudget(value) {
        if (Number(value) === NaN) throw new Error('Please enter a valid number value for the envelope budget.');
    }

    set budgetedValueUSD(value) {
        try {
            this.validateBudget(value);
            this._budgetedValueUSD = Number(value);
        } catch (err) {
            console.error('Validation failed:', err.message);
        }
    }

// Getter, setter, and validation for totalSpentUSD
    get totalSpentUSD() {
        return this._totalSpentUSD;
    }

    validateTotalSpent(value) {
        if (Number(value) === NaN) throw new Error('Please enter a valid number value for the envelope budget.');
        if (Number(value) > this.budgetedValueUSD) throw new Error(`Total spent for the envelope must be less than budgeted value: ${this.budgetedValueUSD}.`);
        if (Number(value) <= 0) throw new Error('Total spent must be greater than 0 USD.');
    }

    set totalSpentUSD(value) {
        try {
            this.validateTotalSpent(value);
            this._totalSpentUSD = Number(value);
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }
};

class Expense {
    static lastExpenseId = 0;

    constructor(expenseName, expenseDescription, expenseAmountUSD, envelopeId) {
        Expense.lastExpenseId += 1;
        this._expenseId = Expense.lastExpenseId;
        this._expenseName = expenseName;
        this._expenseDescription = expenseDescription;
        this._expenseAmountUSD = expenseAmountUSD;
        this._envelopeId = envelopeId;
    }

    // Getter for expenseId
    get expenseId () {
        return this._expenseId;
    }

    // Getter, validation, and setter for expenseName
    get expenseName() {
        return this._expenseName;
    }

    validateExpenseName(name) {
        if (typeof name !== 'string') throw new Error('Please enter a valid string for a name'); 
        if (name.length >= 30) throw new Error('Name length must be less than or equal to 30 characters');
        if (!/^[a-zA-Z]+$/.test(name)) throw new Error('Name can only include letters. No numbers, spaces, or special characters.');
    }
    
    set expenseName(name) {
        try {
            this.validateExpenseName(name);
            this._expenseName = name;
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }

// Getter, setter, and validation for expenseDescription
    get expenseDescription() {
        return this._expenseDescription;
    }
    
    validateExpenseDescription(name) {
        if (typeof name !== 'string') throw new Error('Please enter a valid string for a name.'); 
        if (name.length >= 100) throw new Error('Name length must be less than or equal to 30 characters.');
        if (!/^[a-zA-Z\s]+\.?$/.test(name)) throw new Error('Name can only include letters. No numbers, spaces, or special characters.');
    }
    
    set expenseDescription(description) {
        try {
            this.validateExpenseDescription(description);
            this._expenseDescritpion = description;
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }

    // Getter, setter, and validation for expenseAmountUSD
    get expenseAmountUSD() {
        return this._expenseAmountUSD;
    }

    validateExpenseAmount(value) {
        if (Number(value) === NaN) throw new Error('Please enter a valid number value for the expense amount.');
        if (Number(value) <= 0) throw new Error('Total spent must be greater than 0 USD.');
    }

    set expenseAmountUSD(value) {
        try {
            this.validateExpenseAmount(value);
            this._expenseAmountUSD = Number(value);
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }

    // Getter, setter, and validation for envelopeId
    get envelopeId() {
        return this._envelopeId;
    }

    validateEnvelopeId(id) {
        if (Number(id) === NaN || Number(id) <= 0) {
            throw new Error('Please enter a valid id for the corresponding envelope.')
        };
    }

    set envelopeId(id) {
        try {
            this.validateEnvelopeId(id);
            this._envelopeId = Number(id);
        } catch (err) {
            console.error('Validation failed:', err.message);
            throw err;
        }
    }
};

module.exports = { Envelope, Expense };