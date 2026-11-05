
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing. Please login.' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const jwtResponse = jwt.verify(token, process.env.JWTSECRET)
        req.payload = jwtResponse
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

module.exports = authMiddleware
