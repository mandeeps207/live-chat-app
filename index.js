import express from 'express';
import path from 'path';
import sessionMiddleware from './models/session.js';
import bodyParser from 'body-parser';
import 'dotenv/config';
import {addUser, getUser} from './models/database.js';
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
app.post('/login', async (req, res) => {
    const { username, password, formOption } = req.body;
    if (formOption === 'register') {
        try {
            const salt = bcrypt.genSaltSync(10);
            const hashedPass = bcrypt.hashSync(password, salt);
            const user = await addUser(username, hashedPass);
            if (user) {
                req.session.user = {username: user.username};
                res.status(201).send({message: 'User created successfully. Redirecting to chat dashboard.'});  
            }
        } catch (error) {
            res.status(409).send({message: 'User already exists. Please login or try different username.'});
        }
    } else if (formOption === 'login') {
        try {
            const userLogin = await getUser(username, password);
            if (userLogin) {
              if (await bcrypt.compare(password, userLogin.password)) {
                req.session.user = { username: userLogin.username };
                res.status(201).send({ message: 'Login successfully. Redirecting to chat dashboard.' });
              } else {
                res.status(403).send({ message: 'Invalid username or password!' });
              }
            } else {
              res.status(403).send({ message: 'Invalid username or password!' });
            }
        } catch (error) {
            console.log(error.detail);
            res.status(503).send({ message: 'Server Error. Unable to login!' });
        }            
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