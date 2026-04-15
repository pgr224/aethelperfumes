const bcrypt = require('bcryptjs');
const password = 'Admin@Aethel@2026';
const hash = '$2b$10$tKtWI14gI56TW2u7njHwxewhBLluCQhiQrqo1E0aBxs8IwUUOf45y';
console.log('Testing password:', password);
console.log('Against hash:', hash);
console.log('Match:', bcrypt.compareSync(password, hash));
