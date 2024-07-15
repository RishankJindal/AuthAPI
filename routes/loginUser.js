import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

const loginUser = express.Router();

const validateLogin = [
    check('identifier')
        .notEmpty().withMessage('Email or phone number is required')
        .custom(value => {
            const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
            const isPhone = /^\d{10,15}$/.test(value);
            if (!isEmail && !isPhone) {
                throw new Error('Please provide a valid email or phone number');
            }
            return true;
        }),
    check('password')
        .notEmpty().withMessage('Password is required')
];

loginUser.post('/', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    try {
        const isEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(identifier);
        const user = await userModel.findOne(isEmail ? { email: identifier } : { phone: identifier });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or phone number or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or phone number or password' });
        }

        const accessToken = jwt.sign({ email: user.email }, 'access-secret-key', { expiresIn: '15m' });
        const refreshToken = jwt.sign({ email: user.email }, 'refresh-secret-key', { expiresIn: '7d' });

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

export { loginUser };
