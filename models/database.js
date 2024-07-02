import { createPool } from '@vercel/postgres';
import 'dotenv/config';

const pool = createPool({
  connectionString: process.env.LIVE_CHAT_APP_URL,
});

export async function query(text, params) {
  return pool.connect()
  .then(async client => {
    return client.query(text, params)
      .then(res => {
        client.release();
        return res;
      })
      .catch(err => {
        client.release();
        throw err;
      });
  });
}

// Create table for users
const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE,
        password VARCHAR(100)
      );
    `;
query(queryText);

// Add user
export async function addUser(username, password) {
    const queryText = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    const values = [username, password];
    const res = await query(queryText, values);
    return res.rows[0];
}

// Get user
export async function getUser(username) {
    const queryText = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    const res = await query(queryText, values);
    return res.rows[0];
}