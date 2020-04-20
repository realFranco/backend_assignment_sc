/**
 * Dev: f97gp1@gmail.com
 * 
 * Filename: app.js
 * 
 * Description: 
 * Entry point for the backend assignment.
 */

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');
const express = require('express');

const triangule = require('./routes/triangule');
const post = require('./routes/post');
const commentary = require('./routes/commentary');


var myEnv = dotenv.config();
dotenvExpand(myEnv);

const app = express();
const host = process.env.APP_URL;
const port = process.env.APP_PORT;

// Declaring the set of routes to use
app.use('/triangule', triangule);
app.use('/post', post);
app.use('/commentary', commentary);

// Set the public folder, to serve resources
app.use( express.static('./public') )

// Send the .html view
app.get('/',  (req, res) => {
    res.sendFile('main.html', { root: path.join(__dirname, './view/main/') });
}); 

app.listen(port, () => {
    console.log(`Backend Assignment: Sport Compass at -> ${host}`);
});

module.exports = app;
