-- Add descriptions to existing cruise terminals
-- This migration updates the existing terminal records with detailed descriptions

UPDATE terminals SET description = 'Modern cruise terminal with excellent facilities and easy access to the city center. Ideal for large cruise ships.' WHERE code = 'OCN';

UPDATE terminals SET description = 'Historic terminal named after the famous Mayflower ship. Features convenient parking and passenger amenities.' WHERE code = 'MF';

UPDATE terminals SET description = 'Located in the heart of Southampton, offering quick access to local attractions and transport links.' WHERE code = 'CC';

UPDATE terminals SET description = 'Named after the Queen Elizabeth II. Premium terminal with luxury facilities for international cruise departures.' WHERE code = 'QEII';

UPDATE terminals SET description = 'State-of-the-art terminal designed for modern cruise operations with comprehensive passenger services.' WHERE code = 'HOR';
