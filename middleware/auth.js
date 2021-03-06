const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({msg: 'No token! Authorization error.'})
    }

    try {
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user=decoded.user;
        next();
    } catch (err) {
        console.log(err.message);
        res.status(500).json({msg: "Invalid token!"})
    }
}