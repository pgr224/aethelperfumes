const bcrypt = require('bcryptjs');
const password = 'Admin@Aethel@2026';
const hashes = [
    '$2b$10$l6NczwuUdqxryupPnRySnuumtEBAi87t07oCrVxHE3TmBloMXb7.6', // admin@aethelparfums.com
    '$2b$10$jIUFmNA.PNIeiolp6zE6V.frC7X5CGKIldd8JoUy9eM5/kA8iYY4.', // admin@aethel.com
];

hashes.forEach(hash => {
    console.log(`Checking hash ${hash}:`, bcrypt.compareSync(password, hash));
});
