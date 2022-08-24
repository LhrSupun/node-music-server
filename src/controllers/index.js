const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
module.exports = fs.readdirSync(__dirname).filter((file) => file !== basename).map((file) => [path.basename(file, '.js'), require(`./${file}`)])