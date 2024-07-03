import express from 'express';
import path from 'path';
import sessionMiddleware from './models/session.js';
import bodyParser from 'body-parser';
import 'dotenv/config';
import {addUser, getUser} from './models/database.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const __dirname = path.resolve();

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware);
app.set('views', path.join(__dirname, 'views'));

// Socket.io middelware
io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    const id = socket.handshake.auth.id;
    if(!user) {
        return next(new Error('Invalid username'));
    }
    socket.username = user;
    socket.id = id;
    console.log('handshake', socket.username, socket.id);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// App Routes
app.get('/', (req, res) => {
    res.render('home', {user: req.session.user});
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
    const {username, password, formOption} = req.body;

    if (formOption === 'register') {
        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(password, salt);

        addUser(username, hashedPass)
            .then(user => {
                if (user) {
                    req.session.user = {username: user.username, userId: user.id};
                    res.status(201).send({message: 'User created successfully. Redirecting to chat dashboard.'});
                }
            })
            .catch(error => {
                if (error.code === '23505') { // PostgreSQL unique violation error code
                    res.status(409).send({message: 'User already exists. Please login or try different username.'});
                } else {
                    console.error(error);
                    res.status(500).send({message: 'Server error. Unable to register user.'});
                }
            });
    } else if (formOption === 'login') {
        getUser(username)
            .then(userLogin => {
                if (userLogin) {
                    return bcrypt.compare(password, userLogin.password)
                        .then(passwordMatch => {
                            if (passwordMatch) {
                                req.session.user = {username: userLogin.username, userId: userLogin.id};
                                res.status(201).send({message: 'Login successfully. Redirecting to chat dashboard.'});
                            } else {
                                res.status(403).send({message: 'Invalid username or password!'});
                            }
                        });
                } else {
                    res.status(403).send({message: 'Invalid username or password!'});
                }
            })
            .catch(error => {
                console.error(error);
                res.status(503).send({message: 'Server error. Unable to login!'});
            });
    } else {
        res.status(400).send({message: 'Invalid form option'});
    }
});
app.get('/userdata', (req, res) => {
    if(req.session.user) {
        const {username, userId} = req.session.user;
        res.status(200).send({
            username,
            userId
        });
    } else {
        res.status(200).send({
            username: null,
            userId: null
        });
    }
});

// Socket connection
io.on("connection", (socket) => {
    // ...
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Initiating server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`App is running on port ${port}`);
});