const jwt = require('jsonwebtoken');
const User = require('../models/User');


module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        const { userId } = req.user;
        await User.findByIdAndUpdate({ _id: userId }, { lastSeen: new Date() });
        next();
    } catch (error) {
        const details = JSON.parse(JSON.stringify(error));
        if (details.message) {
            return res.sendStatus(401);
        }
        return res.sendStatus(401);
    }
};