import express from 'express';
import path from 'path';

const app = express();
const __dirname = path.resolve();

// Middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

// Initiating server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});