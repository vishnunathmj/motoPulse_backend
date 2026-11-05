
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Register
exports.register = async (req, res) => {
    const { username, email, password } = req.body
    try {
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({username,email,password: hashedPassword})
        await newUser.save()
        res.status(201).json({message: 'Registration successful'})
    } catch (error) {
        res.status(500).json({ message: 'Registration failed' })
    }
}

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(401).json({message: 'Invalid email or password'})
        }

        const isPasswordMatch = await bcrypt.compare(password,existingUser.password)

        if (!isPasswordMatch) {
            return res.status(401).json({message: 'Invalid email or password'})
        }

        const token = jwt.sign({
                userId: existingUser._id,
                email: existingUser.email
            },
            process.env.JWTSECRET,{ expiresIn: '1d' }
        )

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: 'Login failed'
        })
    }
}
