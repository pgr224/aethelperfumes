const bcrypt = require('bcryptjs');
const fs = require('fs');
bcrypt.hash('Admin@Aethel@2026', 10).then(h => {
    console.log("Real hash:", h);
    console.log("Check:", bcrypt.compareSync('Admin@Aethel@2026', h));
    fs.writeFileSync('hash_out.txt', h, 'utf8');
});
