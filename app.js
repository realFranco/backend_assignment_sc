/**
 * Dev: f97gp1@gmail.com
 * 
 * Filename: app.js
 * 
 * Description: 
 * Entry point for the backend assignment.
 */

const path = require('path');
const express = require('express');

const triangule = require('./routes/triangule');
const post = require('./routes/post');
const commentary = require('./routes/commentary');


const app = express();
var port = 7000;

// Declaring the set of routes to use
app.use('/triangule', triangule);
app.use('/post', post);
app.use('/commentary', commentary);

// Set the public folder, to serve resources
app.use( express.static('./public') )

// Render the welcome page - app selector [triangule, post CRUD]
app.get('/',  (req, res) => {
    console.log(`> Welcome to the main.`);

    res.sendFile('main.html', { root: path.join(__dirname, './view/main/') });
}); 

app.listen(port, () => {
    console.log(`Backend Assignment: Sport Compass at -> http://localhost:${port}`);
});

module.exports = app;
