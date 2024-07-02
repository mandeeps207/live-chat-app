import express from 'express';
import path from 'path';
import sessionMiddleware from './models/session.js';
import bodyParser from 'body-parser';
import 'dotenv/config';
import db from './models/database.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

const app = express();
const __dirname = path.resolve();

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// App Routes
app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API Routes
app.post('/login', (req, res) => {
    const { username, password, formOption } = req.body;

    if (formOption === 'register') {
        db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                return res.status(500).send({ status: 503, message: 'Database error' });
            }
            if (row) {
                return res.status(409).send({ status: 409, message: 'Username already exists. Please choose a different one or try login option.' });
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hashedPass = bcrypt.hashSync(password, salt);
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPass], (err) => {
                    if (err) {
                        return res.status(503).send({ status: 503, message: 'Error in creating account.' });
                    } else {
                        req.session.user = { username };
                        return res.status(200).send({ status: 200, message: 'Account created and logging to chatroom.' });
                    }
                });
            }
        });
    } else if (formOption === 'login') {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                return res.status(500).send({ status: 503, message: 'Database error' });
            }
            if (!row) {
                return res.status(403).send({ message: 'Invalid username or password', status: 403 });
            } else {
                const isValid = bcrypt.compareSync(password, row.password);
                if (isValid) {
                    req.session.user = { username: row.username };
                    return res.status(200).send({ message: 'Login successfully!', status: 200 });
                } else {
                    return res.status(403).send({ message: 'Invalid username or password', status: 403 });
                }
            }
        });
    } else {
        return res.status(400).send({ status: 400, message: 'Invalid form option' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Initiating server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});