// authMiddleware.js
const jwt = require('jsonwebtoken');
const { dbConfig } = require('../Database/dbConfig');

const {JWT_SECRET} = require('../Configs/config');
const  {isUserAdmin} =require('../Controllers/UserController')
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Token not provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err.message);

            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }


        req.user = {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email,
            };
        next();
    });
}

async function verifyAdminRole(req, res, next) {
    const { id } = req.user; //change to verify current role not old role

    if ( await isUserAdmin(id)) {

        next();
    }
    else {

        return res.status(403).json({ error: 'Forbidden - Admin role required' });
    }


}

module.exports = { verifyToken, verifyAdminRole };
