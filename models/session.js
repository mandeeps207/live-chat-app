import session from 'express-session';
import 'dotenv/config';

const sessionOptions = {
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true, // Set true for HTTPS
        sameSite: 'Strict',
    }
};

const sessionMiddleware = session(sessionOptions);

export default sessionMiddleware;