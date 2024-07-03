import session from 'express-session';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.LIVE_CHAT_APP_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const sessionOptions = {
    store: new (require('connect-pg-simple')(session)({
        pool, // Connection pool
        tableName: 'user_sessions' // Use a different table name if desired
    })),
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    }
};

const sessionMiddleware = session(sessionOptions);

export default sessionMiddleware;