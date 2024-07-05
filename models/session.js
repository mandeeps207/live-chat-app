import session from 'express-session';
import 'dotenv/config';
import connectPgSimple from 'connect-pg-simple';
import { createPool } from '@vercel/postgres';

const pgPool = new createPool({
    connectionString: process.env.LIVE_CHAT_APP_URL,
});

const pgSession = connectPgSimple(session);

const sessionOptions = {
    store: new pgSession({
        pool: pgPool, // Connection pool
        tableName: 'user_sessions' // Use a different table name if desired
    }),
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    }
};

const sessionMids = session(sessionOptions);

export default sessionMids;