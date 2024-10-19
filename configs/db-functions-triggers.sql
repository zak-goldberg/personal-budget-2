-- Create expense amount validation trigger

CREATE OR REPLACE FUNCTION expense_amount_validation() RETURNS TRIGGER AS $$
    DECLARE 
        sum_of_expense_amounts money;
        envelope_total_amount_usd money;
    BEGIN
        -- Sum the expense amounts for the given envelope_id
        SELECT COALESCE(SUM(amount_usd), '$0') INTO sum_of_expense_amounts 
        FROM expenses 
        WHERE envelope_id = NEW.envelope_id;

        -- Get the total amount for the envelope
        SELECT total_amount_usd INTO envelope_total_amount_usd 
        FROM envelopes 
        WHERE id = NEW.envelope_id;

    -- Check if adding the new expense will exceed the envelope's budget
        IF (envelope_total_amount_usd - sum_of_expense_amounts - NEW.amount_usd < '$0') THEN
            RAISE EXCEPTION 'New expense amount (amount: %) exceeds remaining budget (remaining_budget: %).', 
            NEW.amount_usd, (envelope_total_amount_usd - sum_of_expense_amounts);
        END IF;
    RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_validation
BEFORE INSERT OR UPDATE ON "expenses"
FOR EACH ROW
EXECUTE FUNCTION expense_amount_validation();

-- Create envelopes audit trigger

CREATE OR REPLACE FUNCTION create_envelopes_audit_record() RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            INSERT INTO envelopes_audit (operation, envelope_id, envelope_name, envelope_description, envelope_total_amount_usd, changed_by, changed_at)
            SELECT 'DELETE', OLD.id, OLD.name, OLD.description, OLD.total_amount_usd, current_user, now();
        ELSIF (TG_OP = 'UPDATE') THEN
            INSERT INTO envelopes_audit (operation, envelope_id, envelope_name, envelope_description, envelope_total_amount_usd, changed_by, changed_at)
            SELECT 'UPDATE', NEW.id, NEW.name, NEW.description, NEW.total_amount_usd, current_user, now();
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO envelopes_audit (operation, envelope_id, envelope_name, envelope_description, envelope_total_amount_usd, changed_by, changed_at)
            SELECT 'INSERT', NEW.id, NEW.name, NEW.description, NEW.total_amount_usd, current_user, now();
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER envelopes_audit
AFTER INSERT OR UPDATE ON "envelopes"
FOR EACH ROW
EXECUTE FUNCTION create_envelopes_audit_record();

-- Create expenses audit trigger

CREATE OR REPLACE FUNCTION create_expenses_audit_record() RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            INSERT INTO expenses_audit (operation, expense_id, envelope_id, expense_description, expense_amount_usd, changed_by, changed_at)
            SELECT 'DELETE', OLD.id, OLD.envelope_id, OLD.description, OLD.amount_usd, current_user, now();
        ELSIF (TG_OP = 'UPDATE') THEN
            INSERT INTO expenses_audit (operation, expense_id, envelope_id, expense_description, expense_amount_usd, changed_by, changed_at)
            SELECT 'UPDATE', NEW.id, NEW.envelope_id, NEW.description, NEW.amount_usd, current_user, now();
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO expenses_audit (operation, expense_id, envelope_id, expense_description, expense_amount_usd, changed_by, changed_at)
            SELECT 'INSERT', NEW.id, NEW.envelope_id, NEW.description, NEW.amount_usd, current_user, now();
        END IF;
        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_audit
AFTER INSERT OR UPDATE ON "expenses"
FOR EACH ROW
EXECUTE FUNCTION create_expenses_audit_record();