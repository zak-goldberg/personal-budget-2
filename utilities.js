// Helper function to validate envelope based on the schema
const validEnvelope = (envelope) => {
      if (
          envelope.envelopeName && typeof envelope.envelopeName === 'string'
          && envelope.envelopeDescription && typeof envelope.envelopeDescription === 'string'
          && envelope.budgetedValueUSD !== null && !Number.isNaN(Number(envelope.budgetedValueUSD))
          && envelope.totalSpentUSD !== null && !Number.isNaN(Number(envelope.totalSpentUSD))
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
        plainEnvelope.budgetedValueUSD = envelope.budgetedValueUSD;
        plainEnvelope.totalSpentUSD = envelope.totalSpentUSD;
        return plainEnvelope;
    } else {
        throw new Error('Failed to convert. Not a valid envelope.');
    }
};

module.exports = { validEnvelope, convertEnvelopeToPlain }