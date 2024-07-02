import express from 'express';
import path from 'path';
import sessionMiddleware from './models/session.js';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
const __dirname = path.resolve();

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware);
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// App Routes
app.get('/', (req, res) => {
    res.render('home', {user: req.session.user});
});
app.get('/register', (req, res) => {
    res.send('Future register page!');
});
app.get('/login', (req, res) => {
    req.session.user = {username: "Mandeep Singh"};
    res.redirect('/');
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Initiating server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});