import express, { urlencoded } from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { registerUser } from './routes/registerUser.js';
import { loginUser } from './routes/loginUser.js';

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.CORS,
    credentials: true
}));
app.use(cookieParser());
app.use(urlencoded({
    extended: true
}));


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI + process.env.DB_NAME)
    .then(() => {
        // Connection msg...
        console.log(`MongoDB connected successfully!`);

        // Routes
        app.use('/api/auth/register', registerUser);
        app.use('/api/auth/login', loginUser);

        // Server listening message
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        })

    })
    .catch((err) => {
        console.log(`MongoDB connection error - ${err}`);
    })
