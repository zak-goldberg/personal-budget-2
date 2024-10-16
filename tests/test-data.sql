-- Add envelope test data
INSERT INTO envelopes (name, description, total_amount_usd)
    VALUES 
        ('Groceries', 'For food and related goods', '$450'),
        ('Gas', 'For going places', '$1000'),
        ('Entertainment', 'Song and dance', '$200');

-- Add expenses test data
INSERT INTO expenses (envelope_id, description, amount_usd)
    VALUES 
        (1, 'Oreos', '$5'),
        (2, 'Gas', '$50'),
        (3, 'ComedyShow', '$25');  