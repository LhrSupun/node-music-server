const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const db = {};

fs.readdirSync(__dirname)
    .filter((file) => file !== basename)
    .forEach((file) => {
        const name = path.basename(file, '.js');
        const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
        db[nameCapitalized] = require(`./${file}`);
    });

module.exports = db;