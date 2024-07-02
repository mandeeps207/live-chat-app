import express from 'express';

const app = express();

// Middelwares setup
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("home");
});

// Initiating server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});