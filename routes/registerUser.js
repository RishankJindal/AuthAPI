import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

const registerUser = express.Router();

const validateRegistration = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits')
        .isNumeric().withMessage('Phone number must be numeric'),
    check('email')
        .isEmail().withMessage('Please provide a valid email address'),
    check('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^\S+$/).withMessage('Password should not contain spaces')
];

registerUser
    .get('/', (req, res) => {
        res.render('registrationPage');
    })
    .post('/', validateRegistration, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, email, password } = req.body;

        try {
            const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
            if (existingUser) {
                return res.status(400).json({ error: 'Email or phone number already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password.toString(), Number.parseInt(salt));

            const accessToken = jwt.sign({ email }, 'access-secret-key', { expiresIn: '15m' });
            const refreshToken = jwt.sign({ email }, 'refresh-secret-key', { expiresIn: '7d' });

            const newUser = new userModel({
                name,
                phone,
                email,
                password: hashedPassword,
                accessToken,
                refreshToken
            });

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    });

export { registerUser };
