const JWT = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const clearToken = JWT.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = clearToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        res.status(401).json({error});
    }
};