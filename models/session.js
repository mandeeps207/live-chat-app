import session from 'express-session';
import 'dotenv/config';

const sessionOptions = {
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true,
        sameSite: 'None',
        maxAge: 86400, // 24 hours
    }
};

const sessionMiddleware = session(sessionOptions);

export default sessionMiddleware;