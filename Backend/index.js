const express = require('express');
const db = require("./db")
const app = express();
const PORT = 8080;
const cors = require('cors');

app.use(cors());

app.use(express.json());

//Mount on API
app.use('/api', require("./api"));

const syncDB = () => db.syncDB();

const serverRun = () => {
    app.listen(PORT, () => {
        console.log(`Live on port: ${PORT}`);
    })
}

syncDB();
serverRun();

module.exports = app;